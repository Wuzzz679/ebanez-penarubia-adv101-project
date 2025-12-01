// pages/api/reviews/[id].js
import { query } from '../../../lib/db.js';  // Fixed import

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case 'GET':
      return getReview(req, res, id);
    case 'PUT':
      return updateReview(req, res, id);
    case 'DELETE':
      return deleteReview(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  }
}

async function getReview(req, res, id) {
  try {
    const reviews = await query('SELECT * FROM reviews WHERE id = ?', [id]);
    
    if (reviews.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    return res.status(200).json({ success: true, review: reviews[0] });
  } catch (error) {
    console.error('Error fetching review:', error);
    return res.status(500).json({ success: false, message: 'Error fetching review', error: error.message });
  }
}

async function updateReview(req, res, id) {
  try {
    const { rating, title, comment, verified_purchase } = req.body;
    
    // Validation
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }
    
    const updateFields = [];
    const updateValues = [];
    
    if (rating !== undefined) {
      updateFields.push('rating = ?');
      updateValues.push(rating);
    }
    
    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    
    if (comment !== undefined) {
      updateFields.push('comment = ?');
      updateValues.push(comment);
    }
    
    if (verified_purchase !== undefined) {
      updateFields.push('verified_purchase = ?');
      updateValues.push(verified_purchase);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No fields to update' 
      });
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);
    
    const sql = `UPDATE reviews SET ${updateFields.join(', ')} WHERE id = ?`;
    
    await query(sql, updateValues);
    
    const [updatedReview] = await query('SELECT * FROM reviews WHERE id = ?', [id]);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Review updated successfully',
      review: updatedReview[0]
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({ success: false, message: 'Error updating review', error: error.message });
  }
}

async function deleteReview(req, res, id) {
  try {
    await query('DELETE FROM reviews WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ success: false, message: 'Error deleting review', error: error.message });
  }
}