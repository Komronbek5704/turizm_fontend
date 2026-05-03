const pool = require('../config/database');

const createTables = async () => {
  try {
    console.log('🔄 Creating database tables...');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        avatar_url VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tours table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tours (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        destination VARCHAR(100) NOT NULL,
        available_spots INTEGER DEFAULT 20,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bookings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        travel_date DATE NOT NULL,
        number_of_people INTEGER NOT NULL DEFAULT 1,
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        subject VARCHAR(200),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Chat messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        sender_type VARCHAR(10) NOT NULL, -- 'user' or 'admin'
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        payment_method VARCHAR(20) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_url VARCHAR(500),
        payment_id VARCHAR(100) NOT NULL,
        transaction_id VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables created successfully!');

    // Insert sample data
    await insertSampleData();
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await pool.end();
  }
};

const insertSampleData = async () => {
  try {
    console.log('🔄 Inserting sample data...');

    // Insert admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['Administrator', 'admin@tourvoyage.com', hashedPassword, 'admin']);

    // Insert sample tours
    const sampleTours = [
      {
        name: 'Paris Romance Package',
        description: 'Experience the city of love with our exclusive Paris package. Visit Eiffel Tower, Louvre Museum, and enjoy romantic Seine river cruise.',
        price: 2499.99,
        duration: '7 days / 6 nights',
        image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        destination: 'Paris, France'
      },
      {
        name: 'Dubai Luxury Experience',
        description: 'Discover the modern wonders of Dubai. Visit Burj Khalifa, Dubai Mall, and enjoy desert safari with luxury accommodation.',
        price: 3299.99,
        duration: '5 days / 4 nights',
        image_url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        destination: 'Dubai, UAE'
      },
      {
        name: 'Tokyo Adventure',
        description: 'Explore the perfect blend of tradition and technology in Tokyo. Visit temples, experience modern culture, and enjoy authentic Japanese cuisine.',
        price: 2899.99,
        duration: '8 days / 7 nights',
        image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        destination: 'Tokyo, Japan'
      },
      {
        name: 'New York City Explorer',
        description: 'The city that never sleeps awaits! Visit Times Square, Central Park, Statue of Liberty, and experience Broadway shows.',
        price: 2199.99,
        duration: '6 days / 5 nights',
        image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        destination: 'New York, USA'
      },
      {
        name: 'Istanbul Historical Tour',
        description: 'Discover the rich history of Istanbul. Visit Hagia Sophia, Blue Mosque, Grand Bazaar, and enjoy Bosphorus cruise.',
        price: 1899.99,
        duration: '5 days / 4 nights',
        image_url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        destination: 'Istanbul, Turkey'
      },
      {
        name: 'Maldives Paradise',
        description: 'Relax in the tropical paradise of Maldives. Enjoy crystal clear waters, white sand beaches, and luxury overwater villas.',
        price: 4499.99,
        duration: '7 days / 6 nights',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        destination: 'Maldives'
      }
    ];

    for (const tour of sampleTours) {
      await pool.query(`
        INSERT INTO tours (name, description, price, duration, image_url, destination)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [tour.name, tour.description, tour.price, tour.duration, tour.image_url, tour.destination]);
    }

    console.log('✅ Sample data inserted successfully!');
    
  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  }
};

// Run the script
if (require.main === module) {
  createTables();
}

module.exports = { createTables, insertSampleData };
