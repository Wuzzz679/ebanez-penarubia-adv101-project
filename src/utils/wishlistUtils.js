// utils/wishlistUtils.js

const API_BASE = '/api/wishlist';

// Add to wishlist
// Add to wishlist - Updated
export const addToWishlist = async (product, userEmail) => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail: userEmail,
        productId: product.id
      }),
    });

    if (!response.ok) {
      console.log('Utils: HTTP error during add, using localStorage fallback. Status:', response.status);
      // Fallback to localStorage
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      const existingItem = userWishlist.find(item => item.id === product.id);
      
      if (!existingItem) {
        userWishlist.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || product.img,
          slug: product.slug,
          description: product.description,
          size: product.size || "US 9"
        });
        localStorage.setItem(`wishlist_${userEmail}`, JSON.stringify(userWishlist));
      }
      
      return { 
        success: true, 
        message: 'Added to wishlist (local storage fallback)',
        count: userWishlist.length 
      };
    }

    const result = await response.json();
    
    if (result.success) {
      // Also update localStorage as fallback
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      const existingItem = userWishlist.find(item => item.id === product.id);
      
      if (!existingItem) {
        userWishlist.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || product.img,
          slug: product.slug,
          description: product.description,
          size: product.size || "US 9"
        });
        localStorage.setItem(`wishlist_${userEmail}`, JSON.stringify(userWishlist));
      }
      
      return { success: true, message: result.message, count: result.count };
    } else {
      console.log('Utils: Add API returned success:false, using localStorage fallback');
      // Fallback to localStorage
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      const existingItem = userWishlist.find(item => item.id === product.id);
      
      if (!existingItem) {
        userWishlist.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || product.img,
          slug: product.slug,
          description: product.description,
          size: product.size || "US 9"
        });
        localStorage.setItem(`wishlist_${userEmail}`, JSON.stringify(userWishlist));
      }
      
      return { 
        success: true, 
        message: 'Added to wishlist (local storage fallback)',
        count: userWishlist.length 
      };
    }
  } catch (error) {
    console.error('Add to wishlist API error, using localStorage:', error);
    
    // Fallback to localStorage
    const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
    const existingItem = userWishlist.find(item => item.id === product.id);
    
    if (!existingItem) {
      userWishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || product.img,
        slug: product.slug,
        description: product.description,
        size: product.size || "US 9"
      });
      localStorage.setItem(`wishlist_${userEmail}`, JSON.stringify(userWishlist));
    }
    
    return { 
      success: true, 
      message: 'Added to wishlist (local storage)',
      count: userWishlist.length 
    };
  }
};


// Remove from wishlist - FIXED VERSION
export const removeFromWishlist = async (productId, userEmail) => {
  try {
    console.log('📡 Utils: Sending DELETE request to API...');
    console.log('Utils: Product ID:', productId);
    console.log('Utils: User email:', userEmail);
    
    const response = await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail: userEmail,
        productId: productId
      }),
    });

    console.log('Utils: API response status:', response.status);
    
    if (!response.ok) {
      console.log('Utils: HTTP error during remove, using localStorage fallback. Status:', response.status);
      // Don't throw error, just use localStorage fallback
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      const updatedWishlist = userWishlist.filter(item => item.id !== productId);
      localStorage.setItem(`wishlist_${userEmail}`, JSON.stringify(updatedWishlist));
      
      return { 
        success: true, 
        message: 'Removed from wishlist (local storage fallback)',
        count: updatedWishlist.length 
      };
    }
    
    const result = await response.json();
    console.log('Utils: API response data:', result);
    
    if (result.success) {
      // Also update localStorage
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      const updatedWishlist = userWishlist.filter(item => item.id !== productId);
      localStorage.setItem(`wishlist_${userEmail}`, JSON.stringify(updatedWishlist));
      
      console.log('Utils: Updated localStorage, new count:', updatedWishlist.length);
      
      return { 
        success: true, 
        message: result.message, 
        count: result.count 
      };
    } else {
      console.log('Utils: API returned success:false, using localStorage fallback');
      // Don't throw error, just use localStorage fallback
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      const updatedWishlist = userWishlist.filter(item => item.id !== productId);
      localStorage.setItem(`wishlist_${userEmail}`, JSON.stringify(updatedWishlist));
      
      return { 
        success: true, 
        message: 'Removed from wishlist (local storage fallback)',
        count: updatedWishlist.length 
      };
    }
  } catch (error) {
    console.error('Utils: Remove from wishlist API error, using localStorage:', error);
    
    // Fallback to localStorage
    const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
    const updatedWishlist = userWishlist.filter(item => item.id !== productId);
    localStorage.setItem(`wishlist_${userEmail}`, JSON.stringify(updatedWishlist));
    
    console.log('Utils: Fallback to localStorage, new count:', updatedWishlist.length);
    
    return { 
      success: true, 
      message: 'Removed from wishlist (local storage)',
      count: updatedWishlist.length 
    };
  }
};

// Get user wishlist - FIXED VERSION
export const getUserWishlist = async (userEmail) => {
  try {
    console.log('Utils: Fetching wishlist for:', userEmail);
    const response = await fetch(`${API_BASE}?userEmail=${encodeURIComponent(userEmail)}`);
    
    console.log('Utils: Response status:', response.status);
    
    if (!response.ok) {
      console.log('Utils: HTTP error, using localStorage fallback. Status:', response.status);
 
      return JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
    }
    
    const result = await response.json();
    console.log('Utils: Get wishlist API response:', result);
    
    if (result.success) {
      return result.data || [];
    } else {
      console.log('Utils: API returned success:false, using localStorage fallback');
    
      return JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
    }
  } catch (error) {
    console.error('Utils: Get wishlist API error, using localStorage:', error);
    
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
  }
};

// Check if item is in wishlist - Updated
export const checkWishlistItem = async (userEmail, productId) => {
  try {
    const response = await fetch(
      `${API_BASE}?userEmail=${encodeURIComponent(userEmail)}&productId=${productId}`
    );
    
    if (!response.ok) {
      console.log('Utils: Check wishlist HTTP error, using localStorage fallback');
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      return userWishlist.some(item => item.id === productId);
    }
    
    const result = await response.json();
    
    if (result.success) {
      return result.inWishlist;
    } else {
      console.log('Utils: Check wishlist API returned success:false, using localStorage fallback');
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      return userWishlist.some(item => item.id === productId);
    }
  } catch (error) {
    console.error('Check wishlist API error, using localStorage:', error);
    const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
    return userWishlist.some(item => item.id === productId);
  }
};

// Get wishlist count - Updated
export const getWishlistCount = async (userEmail) => {
  try {
    const response = await fetch(
      `${API_BASE}?userEmail=${encodeURIComponent(userEmail)}&type=count`
    );
    
    if (!response.ok) {
      console.log('Utils: Get count HTTP error, using localStorage fallback');
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      return userWishlist.length;
    }
    
    const result = await response.json();
    
    if (result.success) {
      return result.count;
    } else {
      console.log('Utils: Get count API returned success:false, using localStorage fallback');
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      return userWishlist.length;
    }
  } catch (error) {
    console.error('Get wishlist count API error, using localStorage:', error);
    const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
    return userWishlist.length;
  }
};

// Sync local wishlist to server - FIXED VERSION
export const syncWishlistToServer = async (userEmail) => {
  try {
    const localWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
    
    if (localWishlist.length === 0) {
      return true; // Nothing to sync
    }

    // Get server wishlist first
    const serverWishlist = await getUserWishlist(userEmail);
    const serverProductIds = new Set(serverWishlist.map(item => item.id));

    // Add local items that don't exist on server
    let syncSuccess = true;
    for (const item of localWishlist) {
      if (!serverProductIds.has(item.id)) {
        try {
          await addToWishlist(item, userEmail);
        } catch (error) {
          console.error(`Utils: Failed to sync item ${item.id}:`, error);
          syncSuccess = false;
        }
      }
    }

    return syncSuccess;
  } catch (error) {
    console.error('Sync wishlist failed:', error);
    return false;
  }
};