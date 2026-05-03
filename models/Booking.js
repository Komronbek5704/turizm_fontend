const pool = require('../config/database');

class Booking {
  static async create(bookingData) {
    const { user_id, tour_id, travel_date, number_of_people, total_price } = bookingData;
    
    const query = `
      INSERT INTO bookings (user_id, tour_id, travel_date, number_of_people, total_price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [user_id, tour_id, travel_date, number_of_people, total_price];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  static async getAll(limit = 50, offset = 0) {
    const query = `
      SELECT b.*, u.name as user_name, u.email as user_email, 
             t.name as tour_name, t.destination
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN tours t ON b.tour_id = t.id
      ORDER BY b.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT b.*, u.name as user_name, u.email as user_email, 
             t.name as tour_name, t.destination, t.image_url
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN tours t ON b.tour_id = t.id
      WHERE b.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByUserId(user_id, limit = 20, offset = 0) {
    const query = `
      SELECT b.*, t.name as tour_name, t.destination, t.image_url, t.duration
      FROM bookings b
      JOIN tours t ON b.tour_id = t.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [user_id, limit, offset]);
    return result.rows;
  }

  static async findByTourId(tour_id, limit = 20, offset = 0) {
    const query = `
      SELECT b.*, u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.tour_id = $1
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [tour_id, limit, offset]);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const query = `
      UPDATE bookings 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM bookings WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COALESCE(SUM(total_price), 0) as total_revenue,
        COALESCE(AVG(total_price), 0) as avg_booking_price
      FROM bookings
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }

  static async getMonthlyStats(year = new Date().getFullYear()) {
    const query = `
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        COUNT(*) as booking_count,
        COALESCE(SUM(total_price), 0) as revenue
      FROM bookings 
      WHERE EXTRACT(YEAR FROM created_at) = $1
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `;
    
    const result = await pool.query(query, [year]);
    return result.rows;
  }

  static async getUserBookingStats(user_id) {
    const query = `
      SELECT 
        COUNT(*) as total_bookings,
        COALESCE(SUM(total_price), 0) as total_spent,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_trips
      FROM bookings 
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [user_id]);
    return result.rows[0];
  }

  static async getRecentBookings(limit = 5) {
    const query = `
      SELECT b.*, u.name as user_name, t.name as tour_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN tours t ON b.tour_id = t.id
      ORDER BY b.created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

module.exports = Booking;
