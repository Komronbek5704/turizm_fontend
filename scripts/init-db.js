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

    const bcrypt = require('bcryptjs');

    // ─── 1. USERS (1 admin + 9 regular users) ────────────────────────────────
    const adminPassword    = await bcrypt.hash('admin123',  10);
    const defaultPassword  = await bcrypt.hash('password123', 10);

    const usersData = [
      { name: 'Administrator',   email: 'admin@tourvoyage.com',   password: adminPassword,   role: 'admin' },
      { name: 'Alice Johnson',   email: 'alice@example.com',      password: defaultPassword, role: 'user'  },
      { name: 'Bob Martinez',    email: 'bob@example.com',        password: defaultPassword, role: 'user'  },
      { name: 'Clara Schmidt',   email: 'clara@example.com',      password: defaultPassword, role: 'user'  },
      { name: 'David Chen',      email: 'david@example.com',      password: defaultPassword, role: 'user'  },
      { name: 'Emma Wilson',     email: 'emma@example.com',       password: defaultPassword, role: 'user'  },
      { name: 'Frank Nguyen',    email: 'frank@example.com',      password: defaultPassword, role: 'user'  },
      { name: 'Grace Kim',       email: 'grace@example.com',      password: defaultPassword, role: 'user'  },
      { name: 'Henry Patel',     email: 'henry@example.com',      password: defaultPassword, role: 'user'  },
      { name: 'Isabella Torres', email: 'isabella@example.com',   password: defaultPassword, role: 'user'  },
    ];

    for (const u of usersData) {
      await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [u.name, u.email, u.password, u.role]
      );
    }

    // Fetch inserted user IDs in insertion order so FK references are stable
    const usersResult = await pool.query(
      `SELECT id, email FROM users WHERE email = ANY($1) ORDER BY id`,
      [usersData.map(u => u.email)]
    );
    const userMap = {};
    usersResult.rows.forEach(r => { userMap[r.email] = r.id; });

    const adminId = userMap['admin@tourvoyage.com'];
    // Regular user IDs in order (indices 0-8 → users 2-10)
    const regularEmails = usersData.slice(1).map(u => u.email);
    const userIds = regularEmails.map(e => userMap[e]);

    console.log('  ✔ Users inserted');

    // ─── 2. TOURS (10 tours) ─────────────────────────────────────────────────
    const toursData = [
      {
        name: 'Paris Romance Package',
        description: 'Experience the city of love with our exclusive Paris package. Visit the Eiffel Tower, Louvre Museum, and enjoy a romantic Seine river cruise.',
        price: 2499.99,
        duration: '7 days / 6 nights',
        image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        destination: 'Paris, France',
        available_spots: 20,
      },
      {
        name: 'Dubai Luxury Experience',
        description: 'Discover the modern wonders of Dubai. Visit Burj Khalifa, Dubai Mall, and enjoy a desert safari with luxury accommodation.',
        price: 3299.99,
        duration: '5 days / 4 nights',
        image_url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        destination: 'Dubai, UAE',
        available_spots: 15,
      },
      {
        name: 'Tokyo Adventure',
        description: 'Explore the perfect blend of tradition and technology in Tokyo. Visit ancient temples, experience modern pop culture, and savour authentic Japanese cuisine.',
        price: 2899.99,
        duration: '8 days / 7 nights',
        image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        destination: 'Tokyo, Japan',
        available_spots: 18,
      },
      {
        name: 'New York City Explorer',
        description: 'The city that never sleeps awaits! Visit Times Square, Central Park, the Statue of Liberty, and catch a Broadway show.',
        price: 2199.99,
        duration: '6 days / 5 nights',
        image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        destination: 'New York, USA',
        available_spots: 25,
      },
      {
        name: 'Istanbul Historical Tour',
        description: 'Discover the rich history of Istanbul. Visit Hagia Sophia, the Blue Mosque, the Grand Bazaar, and enjoy a Bosphorus cruise.',
        price: 1899.99,
        duration: '5 days / 4 nights',
        image_url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        destination: 'Istanbul, Turkey',
        available_spots: 22,
      },
      {
        name: 'Maldives Paradise Retreat',
        description: 'Relax in the tropical paradise of the Maldives. Enjoy crystal-clear waters, white-sand beaches, and luxury overwater villas.',
        price: 4499.99,
        duration: '7 days / 6 nights',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        destination: 'Maldives',
        available_spots: 10,
      },
      {
        name: 'Rome & Tuscany Escape',
        description: 'Walk through millennia of history in Rome, then unwind in the rolling hills of Tuscany with wine tastings and villa stays.',
        price: 2699.99,
        duration: '9 days / 8 nights',
        image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        destination: 'Rome & Tuscany, Italy',
        available_spots: 16,
      },
      {
        name: 'Bali Spiritual Journey',
        description: 'Immerse yourself in Bali\'s spiritual culture. Explore rice terraces, sacred temples, and rejuvenate with traditional spa treatments.',
        price: 1799.99,
        duration: '8 days / 7 nights',
        image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        destination: 'Bali, Indonesia',
        available_spots: 20,
      },
      {
        name: 'Santorini Sunset Cruise',
        description: 'Sail the Aegean Sea and witness the legendary Santorini sunset. Explore volcanic beaches, whitewashed villages, and world-class wineries.',
        price: 3099.99,
        duration: '6 days / 5 nights',
        image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        destination: 'Santorini, Greece',
        available_spots: 12,
      },
      {
        name: 'Machu Picchu & Amazon Explorer',
        description: 'Trek the Inca Trail to the legendary Machu Picchu, then venture deep into the Amazon rainforest for an unforgettable wildlife experience.',
        price: 3599.99,
        duration: '10 days / 9 nights',
        image_url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        destination: 'Peru',
        available_spots: 14,
      },
    ];

    for (const t of toursData) {
      await pool.query(
        `INSERT INTO tours (name, description, price, duration, image_url, destination, available_spots)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [t.name, t.description, t.price, t.duration, t.image_url, t.destination, t.available_spots]
      );
    }

    // Fetch tour IDs in insertion order
    const toursResult = await pool.query(
      `SELECT id FROM tours WHERE name = ANY($1) ORDER BY id`,
      [toursData.map(t => t.name)]
    );
    const tourIds = toursResult.rows.map(r => r.id);

    console.log('  ✔ Tours inserted');

    // ─── 3. BOOKINGS (10 bookings) ────────────────────────────────────────────
    // Only insert bookings that don't already exist (guard by user_id + tour_id + travel_date)
    const bookingsData = [
      { user_id: userIds[0], tour_id: tourIds[0], travel_date: '2025-03-15', number_of_people: 2, total_price: 4999.98,  status: 'confirmed'  },
      { user_id: userIds[1], tour_id: tourIds[1], travel_date: '2025-04-10', number_of_people: 1, total_price: 3299.99,  status: 'pending'    },
      { user_id: userIds[2], tour_id: tourIds[2], travel_date: '2025-05-20', number_of_people: 3, total_price: 8699.97,  status: 'confirmed'  },
      { user_id: userIds[3], tour_id: tourIds[3], travel_date: '2025-02-28', number_of_people: 2, total_price: 4399.98,  status: 'completed'  },
      { user_id: userIds[4], tour_id: tourIds[4], travel_date: '2025-06-05', number_of_people: 4, total_price: 7599.96,  status: 'pending'    },
      { user_id: userIds[5], tour_id: tourIds[5], travel_date: '2025-07-12', number_of_people: 2, total_price: 8999.98,  status: 'confirmed'  },
      { user_id: userIds[6], tour_id: tourIds[6], travel_date: '2025-08-01', number_of_people: 1, total_price: 2699.99,  status: 'cancelled'  },
      { user_id: userIds[7], tour_id: tourIds[7], travel_date: '2025-09-18', number_of_people: 2, total_price: 3599.98,  status: 'pending'    },
      { user_id: userIds[8], tour_id: tourIds[8], travel_date: '2025-10-03', number_of_people: 3, total_price: 9299.97,  status: 'confirmed'  },
      { user_id: userIds[0], tour_id: tourIds[9], travel_date: '2025-11-22', number_of_people: 2, total_price: 7199.98,  status: 'completed'  },
    ];

    for (const b of bookingsData) {
      await pool.query(
        `INSERT INTO bookings (user_id, tour_id, travel_date, number_of_people, total_price, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [b.user_id, b.tour_id, b.travel_date, b.number_of_people, b.total_price, b.status]
      );
    }

    // Fetch booking IDs in insertion order
    const bookingsResult = await pool.query(
      `SELECT id FROM bookings ORDER BY id LIMIT 10`
    );
    const bookingIds = bookingsResult.rows.map(r => r.id);

    console.log('  ✔ Bookings inserted');

    // ─── 4. MESSAGES (10 contact-form messages) ───────────────────────────────
    const messagesData = [
      { name: 'Alice Johnson',   email: 'alice@example.com',    subject: 'Question about Paris tour',          message: 'Hi, I would like to know if the Paris Romance Package includes airport transfers. Thank you!',                                                    is_read: true  },
      { name: 'Bob Martinez',    email: 'bob@example.com',      subject: 'Dubai tour availability',            message: 'Is the Dubai Luxury Experience available in April? We are a group of 4 people.',                                                               is_read: false },
      { name: 'Clara Schmidt',   email: 'clara@example.com',    subject: 'Dietary requirements',               message: 'I have a gluten intolerance. Can you accommodate special dietary needs on the Tokyo Adventure tour?',                                           is_read: true  },
      { name: 'David Chen',      email: 'david@example.com',    subject: 'Cancellation policy',                message: 'What is your cancellation policy if I need to cancel my booking less than 2 weeks before departure?',                                           is_read: false },
      { name: 'Emma Wilson',     email: 'emma@example.com',     subject: 'Group discount inquiry',             message: 'We have a group of 10 people interested in the Maldives Paradise Retreat. Do you offer group discounts?',                                       is_read: true  },
      { name: 'Frank Nguyen',    email: 'frank@example.com',    subject: 'Visa assistance',                    message: 'Do you provide visa assistance for the Istanbul Historical Tour? I hold a US passport.',                                                        is_read: false },
      { name: 'Grace Kim',       email: 'grace@example.com',    subject: 'Child-friendly tours',               message: 'We are travelling with two children aged 6 and 9. Which tours would you recommend for families?',                                              is_read: true  },
      { name: 'Henry Patel',     email: 'henry@example.com',    subject: 'Payment options',                    message: 'Do you accept instalments for the Machu Picchu & Amazon Explorer tour? The full amount is quite large.',                                        is_read: false },
      { name: 'Isabella Torres', email: 'isabella@example.com', subject: 'Santorini honeymoon package',        message: 'My partner and I are planning our honeymoon. Can you customise the Santorini Sunset Cruise with any special romantic additions?',               is_read: false },
      { name: 'James Walker',    email: 'james@example.com',    subject: 'Feedback on Bali tour',              message: 'I recently completed the Bali Spiritual Journey and it was absolutely wonderful. The guides were knowledgeable and the itinerary was perfect!',  is_read: true  },
    ];

    for (const m of messagesData) {
      await pool.query(
        `INSERT INTO messages (name, email, subject, message, is_read)
         VALUES ($1, $2, $3, $4, $5)`,
        [m.name, m.email, m.subject, m.message, m.is_read]
      );
    }

    console.log('  ✔ Messages inserted');

    // ─── 5. CHAT MESSAGES (10 messages) ──────────────────────────────────────
    const chatData = [
      { user_id: userIds[0], admin_id: adminId,  message: 'Hello! I have a question about my Paris booking.',                                    sender_type: 'user',  is_read: true  },
      { user_id: userIds[0], admin_id: adminId,  message: 'Of course! How can I help you with your Paris Romance Package booking?',               sender_type: 'admin', is_read: true  },
      { user_id: userIds[0], admin_id: adminId,  message: 'Does the package include travel insurance?',                                           sender_type: 'user',  is_read: true  },
      { user_id: userIds[1], admin_id: adminId,  message: 'Hi, I need to change the travel date for my Dubai booking.',                           sender_type: 'user',  is_read: true  },
      { user_id: userIds[1], admin_id: adminId,  message: 'Sure, I can help with that. What date would you prefer?',                              sender_type: 'admin', is_read: true  },
      { user_id: userIds[2], admin_id: adminId,  message: 'Is there a pickup service from Narita Airport for the Tokyo tour?',                    sender_type: 'user',  is_read: false },
      { user_id: userIds[3], admin_id: adminId,  message: 'I just completed the New York tour — it was absolutely amazing, thank you!',           sender_type: 'user',  is_read: true  },
      { user_id: userIds[3], admin_id: adminId,  message: 'We are so glad you enjoyed it! We hope to see you on another adventure soon.',         sender_type: 'admin', is_read: true  },
      { user_id: userIds[4], admin_id: adminId,  message: 'Can I add an extra person to my Istanbul booking?',                                    sender_type: 'user',  is_read: false },
      { user_id: userIds[5], admin_id: adminId,  message: 'What is the best time of year to visit the Maldives?',                                 sender_type: 'user',  is_read: false },
    ];

    for (const c of chatData) {
      await pool.query(
        `INSERT INTO chat_messages (user_id, admin_id, message, sender_type, is_read)
         VALUES ($1, $2, $3, $4, $5)`,
        [c.user_id, c.admin_id, c.message, c.sender_type, c.is_read]
      );
    }

    console.log('  ✔ Chat messages inserted');

    // ─── 6. NOTIFICATIONS (10 notifications) ─────────────────────────────────
    const notificationsData = [
      { user_id: userIds[0], title: 'Booking Confirmed',          message: 'Your Paris Romance Package booking for 15 Mar 2025 has been confirmed. Have a wonderful trip!',                    type: 'booking_confirmation', is_read: true  },
      { user_id: userIds[1], title: 'Booking Received',           message: 'We have received your booking for the Dubai Luxury Experience. Our team will confirm it shortly.',                 type: 'info',                 is_read: false },
      { user_id: userIds[2], title: 'Booking Confirmed',          message: 'Your Tokyo Adventure booking for 20 May 2025 is confirmed. Prepare for an incredible journey!',                   type: 'booking_confirmation', is_read: true  },
      { user_id: userIds[3], title: 'Trip Completed',             message: 'We hope you enjoyed your New York City Explorer trip! Please leave a review to help other travellers.',            type: 'success',              is_read: true  },
      { user_id: userIds[4], title: 'Payment Reminder',           message: 'Your Istanbul Historical Tour booking is pending payment. Please complete your payment to secure your spot.',      type: 'warning',              is_read: false },
      { user_id: userIds[5], title: 'Booking Confirmed',          message: 'Your Maldives Paradise Retreat booking for 12 Jul 2025 is confirmed. Get ready for paradise!',                    type: 'booking_confirmation', is_read: false },
      { user_id: userIds[6], title: 'Booking Cancelled',          message: 'Your Rome & Tuscany Escape booking has been cancelled as requested. A refund will be processed within 5–7 days.', type: 'warning',              is_read: true  },
      { user_id: userIds[7], title: 'New Tour Available',         message: 'A new tour to the Northern Lights in Iceland has just been added. Book early to secure your spot!',               type: 'info',                 is_read: false },
      { user_id: userIds[8], title: 'Booking Confirmed',          message: 'Your Santorini Sunset Cruise booking for 3 Oct 2025 is confirmed. Enjoy the Aegean Sea!',                         type: 'booking_confirmation', is_read: false },
      { user_id: userIds[0], title: 'Trip Completed',             message: 'Thank you for completing the Machu Picchu & Amazon Explorer tour! We hope it was an unforgettable experience.',   type: 'success',              is_read: true  },
    ];

    for (const n of notificationsData) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, is_read)
         VALUES ($1, $2, $3, $4, $5)`,
        [n.user_id, n.title, n.message, n.type, n.is_read]
      );
    }

    console.log('  ✔ Notifications inserted');

    // ─── 7. PAYMENTS (10 payments, one per booking) ───────────────────────────
    const paymentsData = [
      { booking_id: bookingIds[0], payment_method: 'card',   amount: 4999.98, payment_id: 'PAY-001-CARD-2025',   transaction_id: 'TXN-CC-10001', status: 'completed' },
      { booking_id: bookingIds[1], payment_method: 'stripe', amount: 3299.99, payment_id: 'PAY-002-STR-2025',    transaction_id: 'TXN-ST-10002', status: 'pending'   },
      { booking_id: bookingIds[2], payment_method: 'paypal', amount: 8699.97, payment_id: 'PAY-003-PPL-2025',    transaction_id: 'TXN-PP-10003', status: 'completed' },
      { booking_id: bookingIds[3], payment_method: 'card',   amount: 4399.98, payment_id: 'PAY-004-CARD-2025',   transaction_id: 'TXN-CC-10004', status: 'completed' },
      { booking_id: bookingIds[4], payment_method: 'stripe', amount: 7599.96, payment_id: 'PAY-005-STR-2025',    transaction_id: 'TXN-ST-10005', status: 'pending'   },
      { booking_id: bookingIds[5], payment_method: 'paypal', amount: 8999.98, payment_id: 'PAY-006-PPL-2025',    transaction_id: 'TXN-PP-10006', status: 'completed' },
      { booking_id: bookingIds[6], payment_method: 'card',   amount: 2699.99, payment_id: 'PAY-007-CARD-2025',   transaction_id: 'TXN-CC-10007', status: 'refunded'  },
      { booking_id: bookingIds[7], payment_method: 'stripe', amount: 3599.98, payment_id: 'PAY-008-STR-2025',    transaction_id: 'TXN-ST-10008', status: 'pending'   },
      { booking_id: bookingIds[8], payment_method: 'paypal', amount: 9299.97, payment_id: 'PAY-009-PPL-2025',    transaction_id: 'TXN-PP-10009', status: 'completed' },
      { booking_id: bookingIds[9], payment_method: 'card',   amount: 7199.98, payment_id: 'PAY-010-CARD-2025',   transaction_id: 'TXN-CC-10010', status: 'completed' },
    ];

    for (const p of paymentsData) {
      await pool.query(
        `INSERT INTO payments (booking_id, payment_method, amount, payment_id, transaction_id, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [p.booking_id, p.payment_method, p.amount, p.payment_id, p.transaction_id, p.status]
      );
    }

    console.log('  ✔ Payments inserted');
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
