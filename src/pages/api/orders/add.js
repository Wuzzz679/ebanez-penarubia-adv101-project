import { addOrder } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📨 Received order data:', req.body);
    
    const { 
      user_email, 
      items,
      customer_name,
      customer_phone,
      customer_address,
      payment_method,
      total
    } = req.body;

    // Validate required fields
    if (!user_email || !items || !customer_name || !customer_phone || !customer_address) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: req.body
      });
    }

    // Save each item individually with customer info
    const results = [];
    for (const item of items) {
      const result = await addOrder({
        user_email,
        product_title: item.title,
        product_image: item.image,
        size: item.size,
        price: item.price,
        quantity: item.quantity,
        payment_method: payment_method || 'cash',
        customer_address,
        customer_name,
        customer_phone
      });
      results.push(result);
    }

    console.log('✅ Orders saved successfully:', results);
    
    res.status(201).json({ 
      success: true, 
      message: 'Orders added successfully', 
      orderIds: results.map(r => r.id)
    });
  } catch (error) {
    console.error('❌ Error adding order:', error);
    res.status(500).json({ 
      error: 'Failed to add order',
      details: error.message
    });
  }
}