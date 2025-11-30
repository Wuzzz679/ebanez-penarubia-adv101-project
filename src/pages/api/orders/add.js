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

    // Validate required fields with better error messages
    if (!user_email) {
      return res.status(400).json({ 
        error: 'User email is required',
        details: 'Please log in to continue'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Cart is empty',
        details: 'Please add items to your cart before checkout'
      });
    }

    if (!customer_name || !customer_phone || !customer_address) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Please fill in name, phone number, and delivery address'
      });
    }

    // Save each item individually with customer info - WITH NULL CHECKS
    const results = [];
    for (const item of items) {
      const result = await addOrder({
        user_email: user_email || '',
        product_title: item.title || item.name || 'Unknown Product',
        product_image: item.image || item.img || '',
        size: item.size || 'Not specified',
        price: item.price ? parseFloat(item.price) : 0,
        quantity: item.quantity ? parseInt(item.quantity) : 1,
        payment_method: payment_method || 'cash',
        customer_address: customer_address || '',
        customer_name: customer_name || '',
        customer_phone: customer_phone || ''
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
      details: error.message,
      suggestion: 'Check if database table has all required columns'
    });
  }
}