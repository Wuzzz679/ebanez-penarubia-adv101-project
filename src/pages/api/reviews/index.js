import { reviewQueries } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { product_id } = req.query;
    
    try {
      if (!product_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Product ID is required' 
        });
      }

      const reviews = await reviewQueries.getProductReviews(product_id);
      
      res.status(200).json({ 
        success: true, 
        reviews 
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch reviews' 
      });
    }
  } else {
    res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
}