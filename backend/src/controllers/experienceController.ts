import { Request, Response } from "express";
import pool from "../config/database";

export const getAllExperiences = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT
        id,
        title,
        description,
        location,
        price::float  AS price,
        duration,
        category,
        image_url,
        rating::float AS rating,
        max_participants,
        created_at
      FROM experiences
    `;
    const values: any[] = [];

    if (search) {
      query += ` WHERE LOWER(title) LIKE $1 OR LOWER(location) LIKE $1`;
      values.push(`%${String(search).toLowerCase()}%`);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching experiences:", error);
    res.status(500).json({ error: "Failed to fetch experiences" });
  }
};

export const getExperienceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const expResult = await pool.query(
      `
      SELECT
        id,
        title,
        description,
        location,
        price::float  AS price,
        duration,
        category,
        image_url,
        rating::float AS rating,
        max_participants,
        created_at
      FROM experiences
      WHERE id = $1
      `,
      [id]
    );

    if (expResult.rows.length === 0) {
      return res.status(404).json({ error: "Experience not found" });
    }

    const slotsResult = await pool.query(
      `
      SELECT *
      FROM slots
      WHERE experience_id = $1
        AND date >= CURRENT_DATE
      ORDER BY date, time
      `,
      [id]
    );

    const experience = expResult.rows[0];
    const slots = slotsResult.rows;

    res.json({ ...experience, slots });
  } catch (error) {
    console.error("Error fetching experience:", error);
    res.status(500).json({ error: "Failed to fetch experience details" });
  }
};
