import { wishlistQueries } from '../../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

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

    const numericProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;

    const existingItem = await wishlistQueries.checkWishlistItem(userEmail, numericProductId);
    
    if (existingItem && existingItem.length > 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'Item already in wishlist',
        alreadyExists: true
      });
    }

    await wishlistQueries.addToWishlist(userEmail, numericProductId);
    
    const countResult = await wishlistQueries.getWishlistCount(userEmail);
    const count = countResult?.count || 0;

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
      const numericProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
      
      const existingItem = await wishlistQueries.checkWishlistItem(userEmail, numericProductId);
      return res.status(200).json({
        success: true,
        inWishlist: existingItem && existingItem.length > 0
      });
    } else if (type === 'count') {
      const countResult = await wishlistQueries.getWishlistCount(userEmail);
      const count = countResult?.count || 0;
      return res.status(200).json({
        success: true,
        count: count
      });
    } else {
      const wishlistItems = await wishlistQueries.getUserWishlist(userEmail);
      return res.status(200).json({
        success: true,
        data: wishlistItems || [],
        count: wishlistItems ? wishlistItems.length : 0
      });
    }
  } catch (error) {
    console.error('Wishlist GET API error:', error);
    
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

    if (!userEmail || !productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User email and product ID are required' 
      });
    }

    const numericProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;

    const result = await wishlistQueries.removeFromWishlist(userEmail, numericProductId);
    
    const countResult = await wishlistQueries.getWishlistCount(userEmail);
    const count = countResult?.count || 0;

    return res.status(200).json({
      success: true,
      message: result?.affectedRows > 0 ? 'Item removed from wishlist' : 'Item not found in wishlist',
      count: count,
      affectedRows: result?.affectedRows || 0
    });
  } catch (error) {
    console.error('Remove from wishlist API error:', error);
    return handleWishlistError(error, res);
  }
}

function handleWishlistError(error, res) {
  if (error.code === 'ER_NO_SUCH_TABLE') {
    return res.status(200).json({
      success: true,
      message: 'Wishlist table not available, using local storage',
      count: 0
    });
  }
  
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(200).json({ 
      success: true, 
      message: 'Item already in wishlist',
      alreadyExists: true
    });
  }
  
  if (error.code === 'ER_NO_REFERENCED_ROW' || error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ 
      success: false, 
      message: 'Product does not exist',
      error: 'Invalid product ID'
    });
  }

  if (error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(200).json({
      success: true,
      message: 'Database connection failed, using local storage',
      count: 0
    });
  }

  if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes('not found')) {
    return res.status(200).json({
      success: true,
      message: 'Item not found in wishlist',
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