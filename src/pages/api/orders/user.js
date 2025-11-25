
import { getOrdersByUser } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_email } = req.query;

    if (!user_email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const orders = await getOrdersByUser(user_email);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}