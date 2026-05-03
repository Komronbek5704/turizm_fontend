const pool = require('../config/database');

class Payment {
  static async create(paymentData) {
    const { booking_id, payment_method, amount, payment_url, payment_id, status = 'pending' } = paymentData;
    
    const query = `
      INSERT INTO payments (booking_id, payment_method, amount, payment_url, payment_id, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [booking_id, payment_method, amount, payment_url, payment_id, status];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM payments WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByBookingId(booking_id) {
    const query = 'SELECT * FROM payments WHERE booking_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [booking_id]);
    return result.rows;
  }

  static async findByPaymentId(payment_id, payment_method) {
    const query = 'SELECT * FROM payments WHERE payment_id = $1 AND payment_method = $2';
    const result = await pool.query(query, [payment_id, payment_method]);
    return result.rows[0];
  }

  static async updateStatus(id, status, transaction_id = null) {
    const query = `
      UPDATE payments 
      SET status = $1, transaction_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    
    const values = [status, transaction_id, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateStatusByPaymentId(payment_id, payment_method, status, transaction_id = null) {
    const query = `
      UPDATE payments 
      SET status = $1, transaction_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE payment_id = $3 AND payment_method = $4
      RETURNING *
    `;
    
    const values = [status, transaction_id, payment_id, payment_method];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAll(limit = 50, offset = 0) {
    const query = `
      SELECT p.*, b.user_id, t.name as tour_name, u.name as user_name, u.email as user_email
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN tours t ON b.tour_id = t.id
      JOIN users u ON b.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_payments,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN status = 'completed' THEN amount END), 0) as avg_payment_amount
      FROM payments
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }

  static async getMonthlyStats(year = new Date().getFullYear()) {
    const query = `
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        COUNT(*) as payment_count,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount END), 0) as revenue
      FROM payments 
      WHERE EXTRACT(YEAR FROM created_at) = $1
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `;
    
    const result = await pool.query(query, [year]);
    return result.rows;
  }

  static async getUserPayments(user_id, limit = 20, offset = 0) {
    const query = `
      SELECT p.*, t.name as tour_name, t.image_url
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN tours t ON b.tour_id = t.id
      WHERE b.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [user_id, limit, offset]);
    return result.rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM payments WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getRecentPayments(limit = 5) {
    const query = `
      SELECT p.*, u.name as user_name, t.name as tour_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN users u ON b.user_id = u.id
      JOIN tours t ON b.tour_id = t.id
      ORDER BY p.created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

module.exports = Payment;
