const pool = require('../config/database');

class ChatMessage {
  static async create(messageData) {
    const { user_id, admin_id, message, sender_type } = messageData;
    
    const query = `
      INSERT INTO chat_messages (user_id, admin_id, message, sender_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [user_id, admin_id, message, sender_type];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  static async getAll(limit = 50, offset = 0) {
    const query = `
      SELECT cm.*, u.name as user_name, u.email as user_email,
             a.name as admin_name
      FROM chat_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      LEFT JOIN users a ON cm.admin_id = a.id
      ORDER BY cm.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async findByUserId(user_id, limit = 50, offset = 0) {
    const query = `
      SELECT cm.*, u.name as user_name, u.email as user_email,
             a.name as admin_name
      FROM chat_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      LEFT JOIN users a ON cm.admin_id = a.id
      WHERE cm.user_id = $1
      ORDER BY cm.created_at ASC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [user_id, limit, offset]);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT cm.*, u.name as user_name, u.email as user_email,
             a.name as admin_name
      FROM chat_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      LEFT JOIN users a ON cm.admin_id = a.id
      WHERE cm.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async markAsRead(id, userId = null) {
    let query;
    let values;
    
    if (userId) {
      // Mark messages as read for specific user
      query = `
        UPDATE chat_messages 
        SET is_read = TRUE
        WHERE user_id = $1 AND sender_type = 'user' AND is_read = FALSE
        RETURNING *
      `;
      values = [userId];
    } else {
      // Mark specific message as read
      query = `
        UPDATE chat_messages 
        SET is_read = TRUE
        WHERE id = $1
        RETURNING *
      `;
      values = [id];
    }
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getUnreadCount(adminId = null) {
    let query;
    let values;
    
    if (adminId) {
      // Get unread messages for admin (messages from users)
      query = `
        SELECT COUNT(*) as count 
        FROM chat_messages 
        WHERE sender_type = 'user' AND is_read = FALSE
      `;
      values = [];
    } else {
      // Get unread messages for user (messages from admin)
      query = `
        SELECT COUNT(*) as count 
        FROM chat_messages 
        WHERE user_id = $1 AND sender_type = 'admin' AND is_read = FALSE
      `;
      values = [adminId];
    }
    
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  }

  static async delete(id) {
    const query = 'DELETE FROM chat_messages WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getChatSessions() {
    const query = `
      SELECT DISTINCT 
        cm.user_id,
        u.name as user_name,
        u.email as user_email,
        MAX(cm.created_at) as last_message_time,
        COUNT(CASE WHEN cm.sender_type = 'user' AND cm.is_read = FALSE THEN 1 END) as unread_count
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      GROUP BY cm.user_id, u.name, u.email
      ORDER BY last_message_time DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN sender_type = 'user' THEN 1 END) as user_messages,
        COUNT(CASE WHEN sender_type = 'admin' THEN 1 END) as admin_messages,
        COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread_messages
      FROM chat_messages
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }

  static async getRecent(limit = 5) {
    const query = `
      SELECT cm.*, u.name as user_name, u.email as user_email
      FROM chat_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      ORDER BY cm.created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

module.exports = ChatMessage;
