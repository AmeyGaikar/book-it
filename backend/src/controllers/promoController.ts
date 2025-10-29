import { Request, Response } from 'express';
import pool from '../config/database';

export const validatePromoCode = async (req: Request, res: Response) => {
  try {
    const { code, amount } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    const result = await pool.query(
      'SELECT * FROM promo_codes WHERE code = $1 AND is_active = true',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        valid: false, 
        error: 'Invalid or expired promo code' 
      });
    }

    const promo = result.rows[0];
    let discount = 0;

    if (promo.discount_type === 'percentage') {
      discount = (amount * promo.discount_value) / 100;
    } else if (promo.discount_type === 'fixed') {
      discount = Math.min(promo.discount_value, amount);
    }

    res.json({
      valid: true,
      code: promo.code,
      discountType: promo.discount_type,
      discountValue: promo.discount_value,
      discountAmount: discount,
      finalAmount: amount - discount
    });

  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ error: 'Failed to validate promo code' });
  }
};
