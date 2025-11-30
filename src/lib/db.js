// lib/db.js
import mysql from "mysql2/promise";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "streetkicks",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  reconnect: true,
  acquireTimeout: 60000,
  timeout: 60000,
  maxIdle: 10,
  idleTimeout: 60000,
};

// Create connection pool
const db = mysql.createPool(dbConfig);

// Test connection on startup
db.getConnection()
  .then(connection => {
    console.log('✅ Connected to MySQL database:', dbConfig.database);
    connection.release();
  })
  .catch(error => {
    console.error('❌ MySQL connection failed:');
    console.error('   Host:', dbConfig.host);
    console.error('   Database:', dbConfig.database);
    console.error('   Error:', error.message);
    console.error('💡 Please ensure:');
    console.error('   1. MySQL server is running');
    console.error('   2. Database "streetkicks" exists');
    console.error('   3. Username and password are correct');
  });

// Enhanced query function with better error handling
export async function query(sql, params = []) {
  let connection;
  try {
    connection = await db.getConnection();
    console.log('📊 Executing query:', sql.substring(0, 100) + '...');
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('❌ Database query error:');
    console.error('   Query:', sql);
    console.error('   Params:', params);
    console.error('   Error:', error.message);
    
    // Handle specific error cases
    if (error.code === 'ER_NO_SUCH_TABLE') {
      throw new Error(`Database table doesn't exist. Please run the SQL setup script.`);
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      throw new Error(`Database access denied. Check your username and password.`);
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      throw new Error(`Database '${dbConfig.database}' doesn't exist. Please create it first.`);
    } else {
      throw new Error(`Database error: ${error.message}`);
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Specific functions for reviews
export const reviewQueries = {
  // Get reviews for a product
  getProductReviews: (productId) => 
    query(
      `SELECT r.*, u.username as user_name 
       FROM reviews r 
       LEFT JOIN users u ON r.user_email = u.email 
       WHERE r.product_id = ? 
       ORDER BY r.created_at DESC`,
      [productId]
    ),

  // Get all reviews with optional rating filter
  getAllReviews: (rating = null) => {
    let sql = `
      SELECT r.*, u.username as user_name, p.name as product_name, p.slug as product_slug 
      FROM reviews r 
      LEFT JOIN users u ON r.user_email = u.email 
      LEFT JOIN products p ON r.product_id = p.id 
      WHERE 1=1
    `;
    const params = [];
    
    if (rating) {
      sql += ' AND r.rating = ?';
      params.push(parseInt(rating));
    }
    
    sql += ' ORDER BY r.created_at DESC';
    return query(sql, params);
  },

  // Check if user already reviewed a product
  checkExistingReview: (productId, userEmail) =>
    query(
      'SELECT id FROM reviews WHERE product_id = ? AND user_email = ?',
      [productId, userEmail]
    ),

  // Submit a new review
  submitReview: (reviewData) =>
    query(
      `INSERT INTO reviews 
       (product_id, user_email, rating, title, comment, verified_purchase) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        reviewData.product_id,
        reviewData.user_email,
        reviewData.rating,
        reviewData.title,
        reviewData.comment,
        reviewData.verified_purchase || false
      ]
    ),

  // Get newly created review with user info
  getReviewById: (reviewId) =>
    query(
      `SELECT r.*, u.username as user_name 
       FROM reviews r 
       LEFT JOIN users u ON r.user_email = u.email 
       WHERE r.id = ?`,
      [reviewId]
    ),

  // Check if user purchased the product (for verified purchase)
  checkUserPurchase: (userEmail, productId) =>
    query(
      `SELECT id FROM orders 
       WHERE user_email = ? 
       AND JSON_CONTAINS(items, JSON_OBJECT('product_id', ?))`,
      [userEmail, productId]
    )
};

// Database initialization function
export async function initializeDatabase() {
  try {
    // Check if required tables exist
    const tables = await query(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('users', 'products', 'reviews', 'orders')
    `, [dbConfig.database]);

    if (tables.length < 4) {
      console.warn('⚠️  Some database tables are missing. Please run the SQL setup script.');
      return false;
    }

    console.log('✅ Database tables verified');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await query('SELECT 1');
    return { healthy: true, message: 'Database connection is healthy' };
  } catch (error) {
    return { healthy: false, message: `Database health check failed: ${error.message}` };
  }
}

// In lib/db.js - Update the wishlistQueries section

export const wishlistQueries = {
  getUserWishlist: (userEmail) => 
    query(
      `SELECT w.*, p.name, p.slug, p.price, p.description, p.image as image 
       FROM wishlist w 
       JOIN products p ON w.product_id = p.id 
       WHERE w.user_email = ? 
       ORDER BY w.created_at DESC`,
      [userEmail]
    ),

  checkWishlistItem: (userEmail, productId) =>
    query(
      'SELECT id FROM wishlist WHERE user_email = ? AND product_id = ?',
      [userEmail, productId]
    ),

  addToWishlist: (userEmail, productId) =>
    query(
      'INSERT INTO wishlist (user_email, product_id) VALUES (?, ?)',
      [userEmail, productId]
    ),

 removeFromWishlist: async (userEmail, productId) => {
  try {
    console.log('🗑️ DB: Executing DELETE query for:', { userEmail, productId });
    
    const [result] = await query(
      'DELETE FROM wishlist WHERE user_email = ? AND product_id = ?',
      [userEmail, productId]
    );
    
    console.log('✅ DB: Delete result:', result);
    console.log('✅ DB: Affected rows:', result.affectedRows);
    
    return result;
  } catch (error) {
    console.error('❌ DB: Remove error:', error);
    throw error;
  }
},

  getWishlistCount: (userEmail) =>
    query(
      'SELECT COUNT(*) as count FROM wishlist WHERE user_email = ?',
      [userEmail]
    ),

  isInWishlist: (userEmail, productId) =>
    query(
      'SELECT id FROM wishlist WHERE user_email = ? AND product_id = ?',
      [userEmail, productId]
    )
};
export default db;