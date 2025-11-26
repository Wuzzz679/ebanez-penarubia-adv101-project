import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { review_id, user_email } = req.body;
    
    try {
      // Validate required fields
      if (!review_id || !user_email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Review ID and user email are required' 
        });
      }

      // Check if the review belongs to the user (security check)
      const userReviews = await query(
        'SELECT id FROM reviews WHERE id = ? AND user_email = ?',
        [review_id, user_email]
      );
      
      if (userReviews.length === 0) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only delete your own reviews' 
        });
      }

      // Delete the review
      await query('DELETE FROM reviews WHERE id = ?', [review_id]);
      
      res.status(200).json({ 
        success: true, 
        message: 'Review deleted successfully' 
      });
      
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete review' 
      });
    }
  } else {
    res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
}