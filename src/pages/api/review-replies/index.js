
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { reviewId } = req.query;
        if (!reviewId) {
          return res.status(400).json({ error: 'reviewId is required' });
        }

  
        const replies = await query(
          'SELECT * FROM review_replies WHERE review_id = ? ORDER BY created_at ASC',
          [reviewId]
        );
        
        res.status(200).json(replies);
      } catch (error) {
        console.error('Error fetching replies:', error);
        res.status(500).json({ error: 'Failed to fetch replies' });
      }
      break;

    case 'POST':
      try {
        const { review_id, user_email, comment } = req.body;
        
      
        if (!review_id || !user_email || !comment) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await query(
          'INSERT INTO review_replies (review_id, user_email, comment) VALUES (?, ?, ?)',
          [review_id, user_email, comment]
        );

  
        const newReply = {
          id: result.insertId,
          review_id: parseInt(review_id),
          user_email,
          comment,
          created_at: new Date().toISOString()
        };

        res.status(201).json(newReply);
      } catch (error) {
        console.error('Error posting reply:', error);
        res.status(500).json({ error: 'Failed to post reply' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}