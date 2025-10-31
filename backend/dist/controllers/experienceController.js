"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExperienceById = exports.getAllExperiences = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAllExperiences = async (req, res) => {
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
        const values = [];
        if (search) {
            query += ` WHERE LOWER(title) LIKE $1 OR LOWER(location) LIKE $1`;
            values.push(`%${String(search).toLowerCase()}%`);
        }
        query += ` ORDER BY created_at DESC`;
        const result = await database_1.default.query(query, values);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Error fetching experiences:", error);
        res.status(500).json({ error: "Failed to fetch experiences" });
    }
};
exports.getAllExperiences = getAllExperiences;
const getExperienceById = async (req, res) => {
    try {
        const { id } = req.params;
        const expResult = await database_1.default.query(`
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
      `, [id]);
        if (expResult.rows.length === 0) {
            return res.status(404).json({ error: "Experience not found" });
        }
        const slotsResult = await database_1.default.query(`
      SELECT *
      FROM slots
      WHERE experience_id = $1
        AND date >= CURRENT_DATE
      ORDER BY date, time
      `, [id]);
        const experience = expResult.rows[0];
        const slots = slotsResult.rows;
        res.json({ ...experience, slots });
    }
    catch (error) {
        console.error("Error fetching experience:", error);
        res.status(500).json({ error: "Failed to fetch experience details" });
    }
};
exports.getExperienceById = getExperienceById;
