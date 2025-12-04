

const API_BASE = '/api/wishlist';


export const addToWishlist = async (product, userEmail) => {
  try {

    const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
    
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail: userEmail,
        productId: productId
      }),
    });

    if (!response.ok) {

      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      const existingItem = userWishlist.find(item => item.id === productId);
      
      if (!existingItem) {
        userWishlist.push({
          id: productId,
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
        message: 'Added to wishlist',
        count: userWishlist.length 
      };
    }

    const result = await response.json();
    
    if (result.success) {
   
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      const existingItem = userWishlist.find(item => item.id === productId);
      
      if (!existingItem) {
        userWishlist.push({
          id: productId,
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

      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      const existingItem = userWishlist.find(item => item.id === productId);
      
      if (!existingItem) {
        userWishlist.push({
          id: productId,
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
        message: 'Added to wishlist',
        count: userWishlist.length 
      };
    }
  } catch (error) {
    console.error('Add to wishlist error:', error);
    
   
    const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
    const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
    const existingItem = userWishlist.find(item => item.id === productId);
    
    if (!existingItem) {
      userWishlist.push({
        id: productId,
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
      message: 'Added to wishlist',
      count: userWishlist.length 
    };
  }
};


export const removeFromWishlist = async (productId, userEmail) => {
  try {

    const numericProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
    
    const response = await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail: userEmail,
        productId: numericProductId
      }),
    });
    
    if (!response.ok) {
   
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      const updatedWishlist = userWishlist.filter(item => item.id !== productId);
      localStorage.setItem(`wishlist_${userEmail}`, JSON.stringify(updatedWishlist));
      
      return { 
        success: true, 
        message: 'Removed from wishlist',
        count: updatedWishlist.length 
      };
    }
    
    const result = await response.json();
    
    if (result.success) {
   
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      const updatedWishlist = userWishlist.filter(item => item.id !== productId);
      localStorage.setItem(`wishlist_${userEmail}`, JSON.stringify(updatedWishlist));
      
      return { 
        success: true, 
        message: result.message, 
        count: result.count
      };
    } else {

      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      const updatedWishlist = userWishlist.filter(item => item.id !== productId);
      localStorage.setItem(`wishlist_${userEmail}`, JSON.stringify(updatedWishlist));
      
      return { 
        success: true, 
        message: 'Removed from wishlist',
        count: updatedWishlist.length 
      };
    }
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    
 
    const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
    const updatedWishlist = userWishlist.filter(item => item.id !== productId);
    localStorage.setItem(`wishlist_${userEmail}`, JSON.stringify(updatedWishlist));
    
    return { 
      success: true, 
      message: 'Removed from wishlist',
      count: updatedWishlist.length 
    };
  }
};


export const getUserWishlist = async (userEmail) => {
  try {
    const response = await fetch(`${API_BASE}?userEmail=${encodeURIComponent(userEmail)}`);
    
    if (!response.ok) {
      return JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
    }
    
    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    } else {
      return JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
    }
  } catch (error) {
    console.error('Get wishlist error:', error);
    return JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
  }
};


export const checkWishlistItem = async (userEmail, productId) => {
  try {
    const numericProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
    
    const response = await fetch(
      `${API_BASE}?userEmail=${encodeURIComponent(userEmail)}&productId=${numericProductId}`
    );
    
    if (!response.ok) {
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      return userWishlist.some(item => item.id === productId);
    }
    
    const result = await response.json();
    
    if (result.success) {
      return result.inWishlist;
    } else {
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      return userWishlist.some(item => item.id === productId);
    }
  } catch (error) {
    console.error('Check wishlist error:', error);
    const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
    return userWishlist.some(item => item.id === productId);
  }
};

export const getWishlistCount = async (userEmail) => {
  try {
    const response = await fetch(
      `${API_BASE}?userEmail=${encodeURIComponent(userEmail)}&type=count`
    );
    
    if (!response.ok) {
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      return userWishlist.length;
    }
    
    const result = await response.json();
    
    if (result.success) {
      return result.count;
    } else {
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      return userWishlist.length;
    }
  } catch (error) {
    console.error('Get wishlist count error:', error);
    const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
    return userWishlist.length;
  }
};


export const syncWishlistToServer = async (userEmail) => {
  try {
    const localWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
    
    if (localWishlist.length === 0) {
      return true;
    }


    const serverWishlist = await getUserWishlist(userEmail);
    const serverProductIds = new Set(serverWishlist.map(item => item.id));

 
    let syncSuccess = true;
    for (const item of localWishlist) {
      if (!serverProductIds.has(item.id)) {
        try {
          await addToWishlist(item, userEmail);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
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