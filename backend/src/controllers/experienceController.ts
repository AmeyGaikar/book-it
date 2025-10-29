import { Request, Response } from 'express';
import pool from '../config/database';

export const getAllExperiences = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM experiences ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
};

export const getExperienceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get experience details
    const expResult = await pool.query(
      'SELECT * FROM experiences WHERE id = $1',
      [id]
    );

    if (expResult.rows.length === 0) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Get available slots for this experience
    const slotsResult = await pool.query(
      `SELECT * FROM slots 
       WHERE experience_id = $1 
       AND date >= CURRENT_DATE
       ORDER BY date, time`,
      [id]
    );

    const experience = expResult.rows[0];
    const slots = slotsResult.rows;

    res.json({ ...experience, slots });
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({ error: 'Failed to fetch experience details' });
  }
};
