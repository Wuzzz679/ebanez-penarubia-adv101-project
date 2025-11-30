"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/wishlist.module.css";
import Link from "next/link";
import { 
  removeFromWishlist, 
  getUserWishlist, 
  syncWishlistToServer,
  getWishlistCount 
} from '../utils/wishlistUtils';

export default function Wishlist() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUsername = localStorage.getItem("username");
    
    if (storedUser) {
      setUser(storedUser);
      setUsername(storedUsername || storedUser.split('@')[0]);
      
      // Load user data
      loadUserData(storedUser);
    } else {
      // Redirect to login if not authenticated
      router.push("/login");
    }
  }, [router]);

  // In your wishlist page component - Update the loadUserData function

// In your wishlist page component - Update the loadUserData function

const loadUserData = async (userEmail) => {
  try {
    setLoading(true);
    setSyncStatus('syncing');
    
    console.log('🔄 Loading user data for:', userEmail);
    
    // Load cart count first (this should always work)
    try {
      const userCart = JSON.parse(localStorage.getItem(`cart_${userEmail}`)) || [];
      setCartCount(userCart.length);
      console.log('✅ Cart count loaded:', userCart.length);
    } catch (cartError) {
      console.error('Failed to load cart:', cartError);
      setCartCount(0);
    }
    
    // Try to load wishlist from localStorage first as fallback
    let localWishlist = [];
    try {
      localWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      console.log('📦 Local wishlist items:', localWishlist.length);
    } catch (localError) {
      console.error('Failed to load local wishlist:', localError);
      localWishlist = [];
    }
    
    // Try to sync, but don't block if it fails
    try {
      console.log('🔄 Attempting to sync with server...');
      const syncResult = await syncWishlistToServer(userEmail);
      setSyncStatus(syncResult ? 'synced' : 'local');
      console.log('✅ Sync result:', syncResult ? 'synced' : 'failed');
    } catch (syncError) {
      console.log('❌ Sync failed, using local data:', syncError.message);
      setSyncStatus('local');
    }
    
    // Load wishlist with better error handling
    try {
      console.log('📡 Fetching wishlist from API...');
      const wishlistData = await getUserWishlist(userEmail);
      console.log('✅ Wishlist data loaded from API:', wishlistData.length, 'items');
      
      // If API returned empty but we have local data, use local data
      if (wishlistData.length === 0 && localWishlist.length > 0) {
        console.log('🔄 API returned empty, using local wishlist data');
        setWishlistItems(localWishlist);
        setWishlistCount(localWishlist.length);
      } else {
        setWishlistItems(wishlistData);
        setWishlistCount(wishlistData.length);
      }
    } catch (wishlistError) {
      console.log('❌ Failed to load from API, using local storage:', wishlistError.message);
      setWishlistItems(localWishlist);
      setWishlistCount(localWishlist.length);
      setSyncStatus('local');
    }
      
  } catch (error) {
    console.error('💥 Failed to load user data:', error);
    // Final fallback - use localStorage only
    try {
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      setWishlistItems(userWishlist);
      setWishlistCount(userWishlist.length);
      
      const userCart = JSON.parse(localStorage.getItem(`cart_${userEmail}`)) || [];
      setCartCount(userCart.length);
    } catch (finalError) {
      console.error('💥 Even final fallback failed:', finalError);
      setWishlistItems([]);
      setWishlistCount(0);
      setCartCount(0);
    }
    setSyncStatus('local');
  } finally {
    setLoading(false);
    console.log('🏁 User data loading complete');
  }
};

  const handleRemoveFromWishlist = async (productId) => {
    if (!user) return;
    
    console.log('=== FRONTEND REMOVE DEBUG START ===');
    console.log('Removing product ID:', productId);
    console.log('User email:', user);
    console.log('Current wishlist items count:', wishlistItems.length);
    
    try {
      console.log('📡 Calling removeFromWishlist utility...');
      const result = await removeFromWishlist(productId, user);
      console.log('✅ Remove API result:', result);
      
      if (result.success) {
        const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
        setWishlistItems(updatedWishlist);
        setWishlistCount(updatedWishlist.length);
        console.log('✅ UI updated successfully. New count:', updatedWishlist.length);
        console.log('=== FRONTEND REMOVE DEBUG END ===');
        alert("Item removed from wishlist!");
      } else {
        console.error('❌ Failed to remove item:', result.message);
        console.log('=== FRONTEND REMOVE DEBUG END ===');
        alert("Failed to remove item from wishlist. Please try again.");
      }
    } catch (error) {
      console.error('❌ Error in handleRemoveFromWishlist:', error);
      const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
      setWishlistItems(updatedWishlist);
      setWishlistCount(updatedWishlist.length);
      console.log('✅ Fallback: Removed from UI anyway');
      console.log('=== FRONTEND REMOVE DEBUG END ===');
      alert("Item removed from wishlist!");
    }
  };

  const moveToCart = async (product) => {
    if (!user) return;
    
    try {
      // Add to cart
      const userCart = JSON.parse(localStorage.getItem(`cart_${user}`)) || [];
      const existingItemIndex = userCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex === -1) {
        userCart.push({ 
          ...product, 
          quantity: 1, 
          size: product.size || "US 9" 
        });
      } else {
        userCart[existingItemIndex].quantity += 1;
      }
      
      localStorage.setItem(`cart_${user}`, JSON.stringify(userCart));
      setCartCount(userCart.length);
      
      // Remove from wishlist
      await handleRemoveFromWishlist(product.id);
      
      alert("Product moved to cart!");
    } catch (error) {
      console.error('Failed to move to cart:', error);
      alert("Failed to move item to cart. Please try again.");
    }
  };

  const handleSizeChange = (productId, newSize) => {
    // Update size in local state
    const updatedWishlist = wishlistItems.map(item => 
      item.id === productId ? { ...item, size: newSize } : item
    );
    setWishlistItems(updatedWishlist);
    
    // Update localStorage
    localStorage.setItem(`wishlist_${user}`, JSON.stringify(updatedWishlist));
  };

  const getDisplayName = () => {
    if (username && username !== user) {
      return username;
    }
    return user ? user.split('@')[0] : '';
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    router.push("/");
  };

  const clearWishlist = async () => {
    if (!user || wishlistItems.length === 0) return;
    
    const confirmClear = confirm("Are you sure you want to clear your entire wishlist?");
    if (!confirmClear) return;
    
    try {
      // Remove all items one by one
      for (const product of wishlistItems) {
        try {
          await removeFromWishlist(product.id, user);
        } catch (error) {
          console.log(`Failed to remove item ${product.id}:`, error.message);
          // Continue with other items
        }
      }
      
      // Clear local state immediately
      setWishlistItems([]);
      setWishlistCount(0);
      alert("Wishlist cleared!");
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      // Still clear the UI even if there are errors
      setWishlistItems([]);
      setWishlistCount(0);
      alert("Wishlist cleared!");
    }
  };

  const retrySync = async () => {
    if (user) {
      setSyncStatus('syncing');
      try {
        const syncResult = await syncWishlistToServer(user);
        const updatedWishlist = await getUserWishlist(user);
        setWishlistItems(updatedWishlist);
        setWishlistCount(updatedWishlist.length);
        setSyncStatus(syncResult ? 'synced' : 'local');
      } catch (error) {
        console.error('Retry sync failed:', error);
        setSyncStatus('local');
      }
    }
  };

  const continueShopping = () => {
    router.push("/");
  };

  if (!user) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your wishlist...</p>
          {syncStatus === 'syncing' && (
            <p className={styles.syncMessage}>Syncing with server...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logo} onClick={() => router.push("/")}>StreetKicks</div>
        <ul className={styles.navLinks}>
          <li><a onClick={() => router.push("/")} style={{ cursor: "pointer" }}>Home</a></li>
          <li><a onClick={() => router.push("/myorders")} style={{ cursor: "pointer" }}>My Orders</a></li>
          <li><a onClick={() => router.push("/profile")} style={{ cursor: "pointer" }}>Profile</a></li>
          <li><a onClick={() => router.push("/reviews")} style={{ cursor: "pointer" }}>My Reviews</a></li>
          <li><a onClick={() => router.push("/wishlist")} style={{ cursor: "pointer" }}>Wishlist</a></li>
        </ul>
        <div className={styles.navButtons}>
          <span className={styles.userName}>{getDisplayName()}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
          <button className={styles.cartBtn} onClick={() => router.push("/cart")}>
            🛒 Cart ({cartCount})
          </button>
        </div>
      </nav>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>My Wishlist</h1>
          <div className={styles.headerInfo}>
            <span className={styles.itemCount}>{wishlistCount} items</span>
            {syncStatus === 'local' && (
              <span className={styles.syncStatus} onClick={retrySync}>
                🔄 Offline Mode - Click to Retry Sync
              </span>
            )}
            {syncStatus === 'synced' && (
              <span className={styles.syncStatus}>
                ✅ Synced
              </span>
            )}
            {syncStatus === 'syncing' && (
              <span className={styles.syncStatus}>
                ⏳ Syncing...
              </span>
            )}
          </div>
        </div>
        {wishlistItems.length > 0 && (
          <div className={styles.headerActions}>
            <button 
              className={styles.continueShoppingBtn}
              onClick={continueShopping}
            >
              Continue Shopping
            </button>
            <button 
              className={styles.clearAllBtn}
              onClick={clearWishlist}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className={styles.emptyWishlist}>
          <div className={styles.emptyIcon}>♡</div>
          <h2>Your wishlist is empty</h2>
          <p>Start adding your favorite sneakers to your wishlist!</p>
          <div className={styles.emptyActions}>
            <button 
              className={styles.shopNowBtn}
              onClick={() => router.push("/")}
            >
              Shop Now
            </button>
            {syncStatus === 'local' && (
              <button 
                className={styles.retryBtn}
                onClick={retrySync}
              >
                Retry Sync
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.productsSection}>
          <div className={styles.productsGrid}>
            {wishlistItems.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productImageContainer}>
                  <Link href={`/shoe/${product.slug}`} className={styles.linkReset}>
                    <img src={product.image || product.img} alt={product.name} />
                  </Link>
                  <button 
                    className={styles.quickRemoveBtn}
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    title="Remove from wishlist"
                  >
                    ×
                  </button>
                </div>
                
                <Link href={`/shoe/${product.slug}`} className={styles.linkReset}>
                  <h2>{product.name}</h2>
                  <p className={styles.price}>₱{product.price?.toLocaleString()}</p>
                  {product.description && (
                    <p className={styles.description}>{product.description}</p>
                  )}
                </Link>
                
                <select 
                  className={styles.sizeSelect}
                  value={product.size || "US 9"}
                  onChange={(e) => handleSizeChange(product.id, e.target.value)}
                >
                  <option value="US 7">US 7</option>
                  <option value="US 8">US 8</option>
                  <option value="US 9">US 9</option>
                  <option value="US 10">US 10</option>
                  <option value="US 11">US 11</option>
                  <option value="US 12">US 12</option>
                </select>
                
                <div className={styles.buttonGroup}>
                  <button 
                    className={styles.addToCartBtn}
                    onClick={() => moveToCart(product)}
                  >
                    Move to Cart
                  </button>
                  <button 
                    className={styles.removeBtn}
                    onClick={() => handleRemoveFromWishlist(product.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}