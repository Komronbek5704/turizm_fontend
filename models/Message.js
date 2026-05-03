const pool = require('../config/database');

class Message {
  static async create(messageData) {
    const { name, email, subject, message } = messageData;
    
    const query = `
      INSERT INTO messages (name, email, subject, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [name, email, subject, message];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  static async getAll(limit = 50, offset = 0) {
    const query = `
      SELECT * FROM messages 
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM messages WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async markAsRead(id) {
    const query = `
      UPDATE messages 
      SET is_read = TRUE
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getUnreadCount() {
    const query = 'SELECT COUNT(*) as count FROM messages WHERE is_read = FALSE';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  static async delete(id) {
    const query = 'DELETE FROM messages WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread_messages,
        COUNT(CASE WHEN is_read = TRUE THEN 1 END) as read_messages
      FROM messages
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }

  static async getRecent(limit = 5) {
    const query = `
      SELECT * FROM messages 
      ORDER BY created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

module.exports = Message;
