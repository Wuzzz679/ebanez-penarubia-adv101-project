import { reviewQueries } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { rating } = req.query;
    
    try {
      const reviews = await reviewQueries.getAllReviews(rating);
      
      res.status(200).json({ 
        success: true, 
        reviews 
      });
    } catch (error) {
      console.error('Error fetching all reviews:', error);
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