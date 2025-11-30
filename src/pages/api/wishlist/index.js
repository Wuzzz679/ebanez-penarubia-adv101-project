import { wishlistQueries } from '../../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  console.log(`=== WISHLIST API ${method} REQUEST ===`);
  console.log('Request method:', method);
  console.log('Request query:', req.query);
  console.log('Request body:', req.body);

  switch (method) {
    case 'POST':
      return await addToWishlist(req, res);
    case 'GET':
      return await handleGetRequests(req, res);
    case 'DELETE':
      return await removeFromWishlist(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function addToWishlist(req, res) {
  try {
    const { userEmail, productId } = req.body;

    if (!userEmail || !productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User email and product ID are required' 
      });
    }

    // Check if already in wishlist
    const existingItem = await wishlistQueries.checkWishlistItem(userEmail, productId);
    
    if (existingItem.length > 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'Item already in wishlist',
        alreadyExists: true
      });
    }

    // Add to wishlist
    await wishlistQueries.addToWishlist(userEmail, productId);
    
    // Get updated count
    const countResult = await wishlistQueries.getWishlistCount(userEmail);
    const count = countResult[0].count;

    return res.status(200).json({
      success: true,
      message: 'Item added to wishlist',
      count: count
    });
  } catch (error) {
    console.error('Add to wishlist API error:', error);
    return handleWishlistError(error, res);
  }
}

async function handleGetRequests(req, res) {
  const { userEmail, productId, type } = req.query;

  if (!userEmail) {
    return res.status(400).json({ 
      success: false, 
      message: 'User email is required' 
    });
  }

  try {
    if (productId) {
      // Check if specific item is in wishlist
      const existingItem = await wishlistQueries.checkWishlistItem(userEmail, productId);
      return res.status(200).json({
        success: true,
        inWishlist: existingItem.length > 0
      });
    } else if (type === 'count') {
      // Get wishlist count only
      const countResult = await wishlistQueries.getWishlistCount(userEmail);
      const count = countResult[0].count;
      return res.status(200).json({
        success: true,
        count: count
      });
    } else {
      // Get full wishlist
      const wishlistItems = await wishlistQueries.getUserWishlist(userEmail);
      return res.status(200).json({
        success: true,
        data: wishlistItems,
        count: wishlistItems.length
      });
    }
  } catch (error) {
    console.error('Wishlist GET API error:', error);
    
    // Graceful fallback for database errors
    if (error.message.includes('wishlist') || error.message.includes('table') || error.code) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        message: 'Using local storage mode'
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch wishlist data',
      error: error.message 
    });
  }
}

async function removeFromWishlist(req, res) {
  try {
    const { userEmail, productId } = req.body;

    console.log('=== REMOVE WISHLIST DEBUG START ===');
    console.log('Request body:', req.body);
    console.log('User email:', userEmail);
    console.log('Product ID:', productId);
    console.log('Product ID type:', typeof productId);

    if (!userEmail || !productId) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'User email and product ID are required' 
      });
    }

    // Convert productId to number if needed
    const numericProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
    
    console.log('Numeric product ID:', numericProductId);
    console.log('Numeric product ID type:', typeof numericProductId);

    // Check if item exists first
    console.log('🔍 Checking if item exists in database...');
    const existingItem = await wishlistQueries.checkWishlistItem(userEmail, numericProductId);
    console.log('Existing item result:', existingItem);
    console.log('Existing item length:', existingItem.length);
    
    if (existingItem.length === 0) {
      console.log('❌ Item not found in wishlist database');
      // Get current count
      const countResult = await wishlistQueries.getWishlistCount(userEmail);
      const count = countResult[0]?.count || 0;
      
      return res.status(200).json({
        success: true,
        message: 'Item not found in wishlist',
        count: count
      });
    }

    console.log('✅ Item found, attempting to remove from database...');
    
    // Remove from wishlist
    console.log('🗑️ Executing removeFromWishlist query...');
    const result = await wishlistQueries.removeFromWishlist(userEmail, numericProductId);
    console.log('Database removal result:', result);
    console.log('Affected rows:', result?.affectedRows);
    
    // Get updated count
    console.log('📊 Getting updated count...');
    const countResult = await wishlistQueries.getWishlistCount(userEmail);
    const count = countResult[0]?.count || 0;
    console.log('Updated count:', count);

    console.log('=== REMOVE WISHLIST DEBUG END ===');

    if (result?.affectedRows === 0) {
      console.log('⚠️ No rows affected during deletion');
      return res.status(200).json({
        success: true,
        message: 'Item not found in wishlist (no rows affected)',
        count: count
      });
    }

    console.log('✅ Successfully removed item from wishlist');
    return res.status(200).json({
      success: true,
      message: 'Item removed from wishlist',
      count: count,
      affectedRows: result?.affectedRows
    });
  } catch (error) {
    console.error('❌ Remove from wishlist API error:', error);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      stack: error.stack
    });
    
    return handleWishlistError(error, res);
  }
}

function handleWishlistError(error, res) {
  console.error('🛑 Handling wishlist error:', error.code);
  
  // Handle specific database errors
  if (error.code === 'ER_NO_SUCH_TABLE') {
    return res.status(200).json({
      success: true,
      message: 'Wishlist table not available, using local storage',
      count: 0
    });
  }
  
  // Handle duplicate entry error
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(200).json({ 
      success: true, 
      message: 'Item already in wishlist',
      alreadyExists: true
    });
  }
  
  // Handle foreign key constraint error (product doesn't exist)
  if (error.code === 'ER_NO_REFERENCED_ROW' || error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ 
      success: false, 
      message: 'Product does not exist',
      error: 'Invalid product ID'
    });
  }

  // Handle connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(200).json({
      success: true,
      message: 'Database connection failed, using local storage',
      count: 0
    });
  }
  
  return res.status(500).json({ 
    success: false, 
    message: 'Wishlist operation failed',
    error: error.message,
    code: error.code
  });
}