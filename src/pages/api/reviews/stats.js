import { query } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
   
      const results = await query(`
        SELECT 
          product_id,
          COUNT(*) as reviewCount,
          AVG(rating) as averageRating
        FROM reviews
        GROUP BY product_id
      `);
      
    
      const stats = {};
      results.forEach(item => {
        stats[item.product_id] = {
          reviewCount: item.reviewCount,
          averageRating: parseFloat(item.averageRating).toFixed(1)
        };
      });
      
      return res.status(200).json({
        success: true,
        stats: stats
      });
      
    } catch (error) {
      console.error('Error fetching review stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching review stats',
        error: error.message
      });
    }
  }
  
  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
}