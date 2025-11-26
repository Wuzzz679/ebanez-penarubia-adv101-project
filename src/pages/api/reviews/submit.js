import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { product_id, user_email, rating, title, comment } = req.body;
    
    console.log('Received review submission:', { product_id, user_email, rating, title, comment });
    
    try {
      // Validate required fields
      if (!product_id || !user_email || !rating || !title || !comment) {
        console.log('Missing fields:', { product_id, user_email, rating, title, comment });
        return res.status(400).json({ 
          success: false, 
          message: 'All fields are required',
          error: 'MISSING_FIELDS'
        });
      }

      // Validate rating range
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Rating must be between 1 and 5',
          error: 'INVALID_RATING'
        });
      }

      // Check if user already reviewed this product
      console.log('Checking for existing reviews...');
      const existingReviews = await query(
        'SELECT id FROM reviews WHERE product_id = ? AND user_email = ?',
        [product_id, user_email]
      );
      
      console.log('Existing reviews found:', existingReviews.length);
      
      if (existingReviews.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'You have already reviewed this product',
          error: 'ALREADY_REVIEWED'
        });
      }
      
      // Check if user purchased the product (for verified purchase badge)
      // For now, skip this check since orders table might not exist
      const verified_purchase = false; // Set to false temporarily
      
      console.log('Inserting new review...');
      // Insert the review
      const result = await query(
        `INSERT INTO reviews (product_id, user_email, rating, title, comment, verified_purchase) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [product_id, user_email, rating, title, comment, verified_purchase]
      );
      
      console.log('Review inserted with ID:', result.insertId);
      
      // Get the newly created review with user info
      const [newReview] = await query(
        `SELECT r.*, u.username as user_name 
         FROM reviews r 
         LEFT JOIN users u ON r.user_email = u.email 
         WHERE r.id = ?`,
        [result.insertId]
      );
      
      console.log('New review created:', newReview);
      
      res.status(201).json({ 
        success: true, 
        review: newReview,
        message: 'Review submitted successfully!'
      });
      
    } catch (error) {
      console.error('Error submitting review:', error);
      
      // Handle specific database errors
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({ 
          success: false, 
          message: 'Database tables not set up. Please run the SQL setup script.',
          error: 'MISSING_TABLES'
        });
      }
      
      if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ECONNREFUSED') {
        return res.status(500).json({ 
          success: false, 
          message: 'Database connection failed. Please check your database configuration.',
          error: 'DB_CONNECTION_ERROR'
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Failed to submit review. Please try again.',
        error: 'SERVER_ERROR'
      });
    }
  } else {
    res.status(405).json({ 
      success: false, 
      message: 'Method not allowed',
      error: 'METHOD_NOT_ALLOWED'
    });
  }
}