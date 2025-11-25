import { updateOrderStatus } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { order_id, user_email } = req.body;

    if (!order_id || !user_email) {
      return res.status(400).json({ error: 'Order ID and user email are required' });
    }

    // Optional: Verify that the order belongs to the user
    const result = await updateOrderStatus(order_id, 'cancelled');
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Order cancelled successfully' 
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
}