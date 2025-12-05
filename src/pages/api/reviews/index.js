
import { query } from '../../../lib/db.js';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getReviews(req, res);
    case 'POST':
      return createOrUpdateReview(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  }
}

async function getReviews(req, res) {
  try {
    const { productId } = req.query;
    
    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }
    
    const reviews = await query(
      `SELECT r.* 
       FROM reviews r 
       WHERE r.product_id = ? 
       ORDER BY r.created_at DESC`,
      [productId]
    );
    
   
    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((total, review) => total + review.rating, 0);
      averageRating = (sum / reviews.length).toFixed(1);
    }
    
    return res.status(200).json({ 
      success: true, 
      reviews,
      stats: {
        averageRating: parseFloat(averageRating),
        totalReviews: reviews.length
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching reviews',
      error: error.message 
    });
  }
}

async function createOrUpdateReview(req, res) {
  try {
    const { product_id, user_email, rating, title, comment, verified_purchase } = req.body;
    

    if (!product_id || !user_email || !rating || !title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    const existingReviews = await query(
      'SELECT id FROM reviews WHERE product_id = ? AND user_email = ?',
      [product_id, user_email]
    );
    
    let reviewId;
    let isUpdate = false;
    
    if (existingReviews.length > 0) {
    
      reviewId = existingReviews[0].id;
      isUpdate = true;
      
      await query(
        `UPDATE reviews 
         SET rating = ?, title = ?, comment = ?, verified_purchase = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [rating, title, comment, verified_purchase || false, reviewId]
      );
    } else {

      const result = await query(
        `INSERT INTO reviews 
         (product_id, user_email, rating, title, comment, verified_purchase) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [product_id, user_email, rating, title, comment, verified_purchase || false]
      );
      reviewId = result.insertId;
    }
    
 
    const [review] = await query(
      'SELECT * FROM reviews WHERE id = ?',
      [reviewId]
    );
    
    return res.status(isUpdate ? 200 : 201).json({ 
      success: true, 
      message: isUpdate ? 'Review updated successfully' : 'Review submitted successfully',
      review: review[0],
      isUpdate: isUpdate
    });
    
  } catch (error) {
    console.error('Error creating/updating review:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error saving review',
      error: error.message 
    });
  }
}