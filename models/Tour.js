const pool = require('../config/database');

class Tour {
  static async create(tourData) {
    const { name, description, price, duration, image_url, destination, available_spots = 20 } = tourData;
    
    const query = `
      INSERT INTO tours (name, description, price, duration, image_url, destination, available_spots)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [name, description, price, duration, image_url, destination, available_spots];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  static async getAll(limit = 50, offset = 0) {
    const query = `
      SELECT * FROM tours 
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM tours WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, tourData) {
    const { name, description, price, duration, image_url, destination, available_spots } = tourData;
    
    const query = `
      UPDATE tours 
      SET name = $1, description = $2, price = $3, duration = $4, 
          image_url = $5, destination = $6, available_spots = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;
    
    const values = [name, description, price, duration, image_url, destination, available_spots, id];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM tours WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getAvailable(limit = 10) {
    const query = `
      SELECT * FROM tours 
      WHERE available_spots > 0
      ORDER BY created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  static async getByDestination(destination) {
    const query = `
      SELECT * FROM tours 
      WHERE destination ILIKE $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [`%${destination}%`]);
    return result.rows;
  }

  static async updateAvailableSpots(id, spots) {
    const query = `
      UPDATE tours 
      SET available_spots = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [spots, id]);
    return result.rows[0];
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_tours,
        COUNT(CASE WHEN available_spots > 0 THEN 1 END) as available_tours,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM tours
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }

  static async getPopularTours(limit = 5) {
    // This would be based on booking count in a real implementation
    const query = `
      SELECT t.*, COUNT(b.id) as booking_count
      FROM tours t
      LEFT JOIN bookings b ON t.id = b.tour_id
      GROUP BY t.id
      ORDER BY booking_count DESC, t.created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

module.exports = Tour;
