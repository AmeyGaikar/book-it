import pool from "../config/database";

const createTables = async () => {
  try {
    // Create experiences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS experiences (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        duration VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        image_url TEXT NOT NULL,
        rating DECIMAL(2, 1) DEFAULT 0,
        max_participants INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create slots table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS slots (
        id SERIAL PRIMARY KEY,
        experience_id INTEGER REFERENCES experiences(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        time VARCHAR(50) NOT NULL,
        available_spots INTEGER NOT NULL,
        total_spots INTEGER NOT NULL,
        is_sold_out BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(experience_id, date, time)
      );
    `);

    // Create bookings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        experience_id INTEGER REFERENCES experiences(id),
        slot_id INTEGER REFERENCES slots(id),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        participants INTEGER NOT NULL,
        promo_code VARCHAR(50),
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        total_price DECIMAL(10, 2) NOT NULL,
        booking_status VARCHAR(50) DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create promo_codes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_type VARCHAR(20) NOT NULL,
        discount_value DECIMAL(10, 2) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        valid_from DATE,
        valid_until DATE,
        usage_limit INTEGER,
        usage_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Tables created successfully");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  }
};

const seedData = async () => {
  try {
    // Seed experiences
    const experiencesData = [
      {
        title: "Mountain Hiking Adventure",
        description:
          "Embark on a breathtaking journey through scenic mountain trails with experienced guides. Perfect for nature lovers and adventure seekers.",
        location: "Rocky Mountains, Colorado",
        price: 89.99,
        duration: "6 hours",
        category: "Adventure",
        image_url:
          "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
        rating: 4.8,
        max_participants: 12,
      },
      {
        title: "Sunset Beach Yoga",
        description:
          "Relax and rejuvenate with a peaceful yoga session on the beach during golden hour. All skill levels welcome.",
        location: "Santa Monica, California",
        price: 35.0,
        duration: "90 minutes",
        category: "Wellness",
        image_url:
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        rating: 4.9,
        max_participants: 20,
      },
      {
        title: "City Food Tour",
        description:
          "Discover hidden culinary gems and taste authentic local cuisine on this guided food adventure through the city.",
        location: "New York City, New York",
        price: 75.5,
        duration: "4 hours",
        category: "Food & Drink",
        image_url:
          "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
        rating: 4.7,
        max_participants: 15,
      },
      {
        title: "Wildlife Safari Experience",
        description:
          "Get up close with exotic wildlife in their natural habitat. Professional photography opportunities included.",
        location: "San Diego, California",
        price: 120.0,
        duration: "5 hours",
        category: "Nature",
        image_url:
          "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
        rating: 4.9,
        max_participants: 10,
      },
      {
        title: "Wine Tasting Tour",
        description:
          "Sample premium wines from local vineyards while learning about the winemaking process from expert sommeliers.",
        location: "Napa Valley, California",
        price: 95.0,
        duration: "3 hours",
        category: "Food & Drink",
        image_url:
          "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
        rating: 4.8,
        max_participants: 16,
      },
      {
        title: "Kayaking Adventure",
        description:
          "Paddle through crystal-clear waters and explore hidden coves on this exciting kayaking expedition.",
        location: "Lake Tahoe, Nevada",
        price: 65.0,
        duration: "3 hours",
        category: "Adventure",
        image_url:
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
        rating: 4.6,
        max_participants: 8,
      },
    ];

    for (const exp of experiencesData) {
      const result = await pool.query(
        `INSERT INTO experiences (title, description, location, price, duration, category, image_url, rating, max_participants)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          exp.title,
          exp.description,
          exp.location,
          exp.price,
          exp.duration,
          exp.category,
          exp.image_url,
          exp.rating,
          exp.max_participants,
        ]
      );

      // Create slots for each experience (next 7 days)
      const experienceId = result.rows[0].id;
      const times = ["09:00 AM", "02:00 PM", "05:00 PM"];

      for (let day = 0; day < 7; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);
        const dateStr = date.toISOString().split("T")[0];

        for (const time of times) {
          const totalSpots = exp.max_participants;
          const availableSpots = Math.floor(Math.random() * totalSpots) + 1;

          await pool.query(
            `INSERT INTO slots (experience_id, date, time, available_spots, total_spots, is_sold_out)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              experienceId,
              dateStr,
              time,
              availableSpots,
              totalSpots,
              availableSpots === 0,
            ]
          );
        }
      }
    }

    // Seed promo codes
    await pool.query(
      `INSERT INTO promo_codes (code, discount_type, discount_value, is_active)
       VALUES 
       ('SAVE10', 'percentage', 10, true),
       ('FLAT100', 'fixed', 100, true)
       ON CONFLICT (code) DO NOTHING`
    );

    console.log("✅ Data seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
};

const runSeed = async () => {
  try {
    await createTables();
    await seedData();
    console.log("✅ Database setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

runSeed();
