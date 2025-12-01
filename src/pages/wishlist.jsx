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
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      setUser(storedUser);
      loadUserData(storedUser);
    } else {
      // Redirect to login if not authenticated
      router.push("/login");
    }
  }, [router]);

  const loadUserData = async (userEmail) => {
    try {
      setLoading(true);
      
      // Load cart count
      try {
        const userCart = JSON.parse(localStorage.getItem(`cart_${userEmail}`)) || [];
        setCartCount(userCart.length);
      } catch (cartError) {
        setCartCount(0);
      }
      
      // Try to load wishlist from localStorage first as fallback
      let localWishlist = [];
      try {
        localWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
      } catch (localError) {
        localWishlist = [];
      }
      
      // Try to sync with server
      try {
        await syncWishlistToServer(userEmail);
      } catch (syncError) {
        // Silently fail sync
      }
      
      // Load wishlist from API
      try {
        const wishlistData = await getUserWishlist(userEmail);
        
        // If API returned empty but we have local data, use local data
        if (wishlistData.length === 0 && localWishlist.length > 0) {
          setWishlistItems(localWishlist);
          setWishlistCount(localWishlist.length);
        } else {
          setWishlistItems(wishlistData);
          setWishlistCount(wishlistData.length);
        }
      } catch (wishlistError) {
        setWishlistItems(localWishlist);
        setWishlistCount(localWishlist.length);
      }
      
    } catch (error) {
      // Final fallback - use localStorage only
      try {
        const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`)) || [];
        setWishlistItems(userWishlist);
        setWishlistCount(userWishlist.length);
        
        const userCart = JSON.parse(localStorage.getItem(`cart_${userEmail}`)) || [];
        setCartCount(userCart.length);
      } catch (finalError) {
        setWishlistItems([]);
        setWishlistCount(0);
        setCartCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    if (!user) return;
    
    try {
      const result = await removeFromWishlist(productId, user);
      
      if (result.success) {
        const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
        setWishlistItems(updatedWishlist);
        setWishlistCount(updatedWishlist.length);
        alert("Item removed from wishlist!");
      } else {
        alert("Failed to remove item from wishlist. Please try again.");
      }
    } catch (error) {
      // Fallback: Remove from UI even if API fails
      const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
      setWishlistItems(updatedWishlist);
      setWishlistCount(updatedWishlist.length);
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
          // Continue with other items
        }
      }
      
      // Clear local state immediately
      setWishlistItems([]);
      setWishlistCount(0);
      alert("Wishlist cleared!");
    } catch (error) {
      // Still clear the UI even if there are errors
      setWishlistItems([]);
      setWishlistCount(0);
      alert("Wishlist cleared!");
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
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Minimal Header with only Logo and Cart */}
      <div className={styles.simpleHeader}>
        <div className={styles.logo} onClick={() => router.push("/")}>
          StreetKicks
        </div>
        
        <button 
          className={styles.cartButton}
          onClick={() => router.push("/cart")}
        >
          🛒 Cart ({cartCount})
        </button>
      </div>

      {/* Page Title */}
      <div className={styles.pageTitle}>
        <h1>My Wishlist</h1>
        <div className={styles.itemCount}>{wishlistCount} items</div>
      </div>

      {/* Wishlist Actions */}
      {wishlistItems.length > 0 && (
        <div className={styles.wishlistActions}>
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

      {/* Wishlist Content */}
      {wishlistItems.length === 0 ? (
        <div className={styles.emptyWishlist}>
          <div className={styles.emptyIcon}>♡</div>
          <h2>Your wishlist is empty</h2>
          <p>Start adding your favorite sneakers to your wishlist!</p>
          <button 
            className={styles.shopNowBtn}
            onClick={() => router.push("/")}
          >
            Shop Now
          </button>
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