import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { user_email } = req.query;
    
    try {
      if (!user_email) {
        return res.status(400).json({ 
          success: false, 
          message: 'User email is required' 
        });
      }

      const reviews = await query(
        `SELECT r.*, p.name as product_name, p.slug as product_slug 
         FROM reviews r 
         LEFT JOIN products p ON r.product_id = p.id 
         WHERE r.user_email = ? 
         ORDER BY r.created_at DESC`,
        [user_email]
      );
      
      res.status(200).json({ 
        success: true, 
        reviews 
      });
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch user reviews' 
      });
    }
  } else {
    res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
}