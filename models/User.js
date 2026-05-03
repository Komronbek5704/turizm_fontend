const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { name, email, password, phone, avatar_url, role = 'user' } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (name, email, password, phone, avatar_url, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, phone, avatar_url, role, created_at
    `;
    
    const values = [name, email, hashedPassword, phone, avatar_url, role];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, name, email, phone, avatar_url, role, created_at, updated_at
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, userData) {
    const { name, email, phone, avatar_url } = userData;
    
    const query = `
      UPDATE users 
      SET name = $1, email = $2, phone = $3, avatar_url = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, name, email, phone, avatar_url, role, updated_at
    `;
    
    const values = [name, email, phone, avatar_url, id];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  static async getAll(limit = 50, offset = 0) {
    const query = `
      SELECT id, name, email, phone, avatar_url, role, created_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getStats() {
    const query = 'SELECT COUNT(*) as total_users FROM users';
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = User;
