import { Request, Response } from 'express';
import pool from '../config/database';

export const createBooking = async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    const { experienceId, slotId, name, email, phone, participants, promoCode } = req.body;

    // Validate required fields
    if (!experienceId || !slotId || !name || !email || !phone || !participants) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Start transaction
    await client.query('BEGIN');

    // Check slot availability
    const slotResult = await client.query(
      'SELECT * FROM slots WHERE id = $1 FOR UPDATE',
      [slotId]
    );

    if (slotResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Slot not found' });
    }

    const slot = slotResult.rows[0];

    if (slot.available_spots < participants) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Not enough spots available',
        availableSpots: slot.available_spots
      });
    }

    // Get experience price
    const expResult = await client.query(
      'SELECT price FROM experiences WHERE id = $1',
      [experienceId]
    );
    
    const basePrice = parseFloat(expResult.rows[0].price);
    let totalPrice = basePrice * participants;
    let discountAmount = 0;

    // Apply promo code if provided
    if (promoCode) {
      const promoResult = await client.query(
        'SELECT * FROM promo_codes WHERE code = $1 AND is_active = true',
        [promoCode]
      );

      if (promoResult.rows.length > 0) {
        const promo = promoResult.rows[0];
        
        if (promo.discount_type === 'percentage') {
          discountAmount = (totalPrice * promo.discount_value) / 100;
        } else if (promo.discount_type === 'fixed') {
          discountAmount = Math.min(promo.discount_value, totalPrice);
        }

        totalPrice -= discountAmount;

        // Update promo usage
        await client.query(
          'UPDATE promo_codes SET usage_count = usage_count + 1 WHERE code = $1',
          [promoCode]
        );
      }
    }

    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (experience_id, slot_id, name, email, phone, participants, promo_code, discount_amount, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [experienceId, slotId, name, email, phone, participants, promoCode || null, discountAmount, totalPrice]
    );

    // Update slot availability
    await client.query(
      `UPDATE slots 
       SET available_spots = available_spots - $1,
           is_sold_out = CASE WHEN available_spots - $1 <= 0 THEN true ELSE false END
       WHERE id = $2`,
      [participants, slotId]
    );

    // Commit transaction
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      booking: bookingResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    client.release();
  }
};
