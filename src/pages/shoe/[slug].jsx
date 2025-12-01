import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../../styles/shoe.module.css";
import { addToWishlist } from "../../utils/wishlistUtils";
import Link from 'next/link';

const shoesData = [
  {
    slug: "nike-dunk-low",
    name: "Nike Dunk Low",
    price: "₱7,894",
    images: ["/nike.avif", "/nike-alt1.avif", "/nike-alt2.avif"],
    description: "Classic Nike Dunk Low with street-ready style.",
    id: 1 
  },
  {
    slug: "air-jordan-1-low",
    name: "Air Jordan 1 Low",
    price: "₱6,500",
    images: ["/blurjordan.png", "/jordan-alt1.png", "/jordan-alt2.avif"],
    description: "Clean and iconic Air Jordan 1 Low, perfect for any outfit.",
    id: 2
  },
  {
    slug: "palermo-leather-sneakers",
    name: "Palermo Leather Sneakers Unisex",
    price: "₱4,576",
    images: ["/palermo.avif", "/palermo-alt1.avif", "/palermo-alt2.avif"],
    description: "Premium leather sneakers suitable for men and women.",
    id: 3
  },
  {
    slug: "chuck-taylor-all-star",  
    name: "Chuck Taylor All Star",
    price: "₱3,600", 
    images: ["/chuck.webp","/chuck-alt1.jpg","/chuck-alt2.jpg"],
    description: "Timeless Chuck Taylor All Star sneakers for everyday wear.",
    id: 4
  },
  {
    slug: "adizero-evo-sl", 
    name: "Adizero Evo Sl Men's Shoes", 
    price: "₱4,200", 
    images: ["/adizero.webp","/adizero-alt1.webp","/adizero-alt2.webp"],
    description: "Lightweight and responsive Adizero Evo Sl for runners.",
    id: 5
  },
  {
    slug: "new-balance", 
    name: "740 unisex sneakers shoes", 
    price: "₱4,890", 
    images: ["/nb.webp","/nb-alt1.webp","/nb-alt2.webp"], 
    description: "Comfortable and stylish New Balance sneakers.",
    id: 6
  },
  {
    slug: "air-jordan-4-retro", 
    name: "Air Jordan 4 Retro Men's Basketball Shoes", 
    price: "₱5,000", 
    images: ["/retro.avif", "/retro-alt1.avif", "/retro-alt2.avif"],
    description: "Classic Air Jordan 4 Retro for basketball enthusiasts.",
    id: 7
  }
];

export default function ShoePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0
  });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
    verified_purchase: false
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(storedUser);
      const userCart = JSON.parse(localStorage.getItem(`cart_${storedUser}`)) || [];
      setCartCount(userCart.length);
      
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${storedUser}`)) || [];
      setWishlistCount(userWishlist.length);
    }
  }, []);

  // Load reviews when shoe is loaded
  useEffect(() => {
    if (slug) {
      const shoe = shoesData.find((s) => s.slug === slug);
      if (shoe && shoe.id) {
        fetchReviews(shoe.id);
      }
    }
  }, [slug]);

  const fetchReviews = async (productId) => {
    try {
      setLoadingReviews(true);
      const response = await fetch(`/api/reviews?productId=${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
        
        // Check if current user has a review
        if (user) {
          const existingUserReview = data.reviews.find(review => review.user_email === user);
          setUserReview(existingUserReview);
          
          // If user has a review, pre-fill the form
          if (existingUserReview) {
            setReviewForm({
              rating: existingUserReview.rating,
              title: existingUserReview.title,
              comment: existingUserReview.comment,
              verified_purchase: existingUserReview.verified_purchase
            });
          }
        }
        
        // Calculate average rating
        if (data.reviews.length > 0) {
          const avg = data.reviews.reduce((sum, review) => sum + review.rating, 0) / data.reviews.length;
          setReviewStats({
            averageRating: avg.toFixed(1),
            totalReviews: data.reviews.length
          });
        } else {
          setReviewStats({
            averageRating: 0,
            totalReviews: 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please login to submit a review");
      return;
    }
    
    if (!reviewForm.title.trim()) {
      alert("Please enter a review title");
      return;
    }
    
    const shoe = shoesData.find((s) => s.slug === slug);
    if (!shoe) return;
    
    try {
      setSubmittingReview(true);
      
      const reviewData = {
        product_id: shoe.id,
        user_email: user,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        verified_purchase: reviewForm.verified_purchase
      };
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.isUpdate ? '✓ Review updated successfully!' : '✓ Review submitted successfully!');
        
        // Don't reset form if it was an update
        if (!data.isUpdate) {
          setReviewForm({
            rating: 5,
            title: "",
            comment: "",
            verified_purchase: false
          });
        }
        
        // Refresh reviews
        fetchReviews(shoe.id);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleClearForm = () => {
    setReviewForm({
      rating: 5,
      title: "",
      comment: "",
      verified_purchase: false
    });
    setUserReview(null);
  };

  const loadUserReviewIntoForm = () => {
    if (userReview) {
      setReviewForm({
        rating: userReview.rating,
        title: userReview.title,
        comment: userReview.comment,
        verified_purchase: userReview.verified_purchase
      });
    }
  };

  const renderStars = (rating) => {
    const numericRating = parseFloat(rating);
    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={`${styles.star} ${star <= numericRating ? styles.filled : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (!slug) return <p>Loading...</p>;

  const shoe = shoesData.find((s) => s.slug === slug);
  if (!shoe) return <p>Shoe not found.</p>;

  const sizes = [7, 7.5, 8, 8.5, 9, 9.5, 10];

  const handleAddToCart = () => {
    if (!user) return alert("Please login first!");
    if (!selectedSize) return alert("Please select a size!");

    const cartKey = `cart_${user}`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const item = {
      title: shoe.name,
      price: parseInt(shoe.price.replace(/[₱,]/g, "")),
      quantity: 1,
      size: selectedSize,
      image: shoe.images[selectedImage],
    };

    cart.push(item);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    setCartCount(cart.length);
    alert(`Added ${item.title} (Size ${item.size}) to your cart`);
  };

  const handleAddToWishlist = () => {
    if (!user) {
      alert("Please login to add items to wishlist");
      return;
    }

    const productData = {
      id: shoe.id,
      slug: shoe.slug,
      name: shoe.name,
      price: parseInt(shoe.price.replace(/[₱,]/g, "")),
      img: shoe.images[0],
      description: shoe.description
    };

    const success = addToWishlist(productData, user);
    if (success) {
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${user}`)) || [];
      setWishlistCount(userWishlist.length);
      
      const goToWishlist = confirm("Item added to wishlist! Do you want to view your wishlist?");
      if (goToWishlist) {
        router.push("/wishlist");
      }
    }
  };

  const handleGoToWishlist = () => {
    if (!user) {
      alert("Please login to view your wishlist");
      return;
    }
    router.push("/wishlist");
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 onClick={() => router.push("/")} style={{cursor: "pointer"}}>StreetKicks</h1>
        <div className={styles.navButtons}>
          <button className={styles.wishlistBtn} onClick={handleGoToWishlist}>
            ♡ Wishlist ({wishlistCount})
          </button>
          <div className={styles.cart}>Cart: {cartCount}</div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.imageSection}>
          <img
            src={shoe.images[selectedImage]}
            alt={shoe.name}
            className={styles.mainImage}
          />
          {shoe.images.length > 1 && (
            <div className={styles.thumbnails}>
              {shoe.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${shoe.name} ${idx}`}
                  className={selectedImage === idx ? styles.activeThumbnail : ""}
                  onClick={() => setSelectedImage(idx)}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <h2>{shoe.name}</h2>
          <p className={styles.price}>{shoe.price}</p>
          <p className={styles.description}>{shoe.description}</p>

          {/* Review Summary */}
          <div className={styles.reviewSummary}>
            <div className={styles.reviewRating}>
              <span className={styles.averageRating}>{reviewStats.averageRating}</span>
              {renderStars(reviewStats.averageRating)}
              <span className={styles.reviewCount}>({reviewStats.totalReviews} reviews)</span>
            </div>
            <button 
              className={styles.viewReviewsBtn}
              onClick={() => setShowReviews(!showReviews)}
            >
              {showReviews ? 'Hide Reviews' : 'View Reviews'}
            </button>
          </div>

          <div className={styles.sizes}>
            {sizes.map((size) => (
              <button
                key={size}
                className={selectedSize === size ? styles.selectedSize : styles.sizeBtn}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>

          <div className={styles.buttonGroup}>
            <button className={styles.addToCartBtn} onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button className={styles.addToWishlistBtn} onClick={handleAddToWishlist}>
              ♡ Add to Wishlist
            </button>
          </div>
             <Link href={`/reviews?productId=${shoe.id}`} legacyBehavior>
                <a className={styles.viewReviewsLink}>
                  ✍️ View/Write Reviews
                </a>
             </Link>
        </div>
      </main>

      {/* Reviews Section */}
      {showReviews && (
        <section className={styles.reviewsSection}>
          <h3>Customer Reviews</h3>
          
          {/* Review Form */}
          {user && (
            <div className={styles.reviewForm}>
              <h4>Write a Review</h4>
              
              {/* User Review Notice */}
              {userReview && (
                <div className={styles.userReviewNotice}>
                  <div className={styles.noticeHeader}>
                    <span className={styles.noticeIcon}>✎</span>
                    <strong>You've already reviewed this product</strong>
                  </div>
                  <p>Editing will update your existing review</p>
                  <div className={styles.noticeActions}>
                    <button 
                      onClick={loadUserReviewIntoForm}
                      className={styles.loadReviewBtn}
                    >
                      ↻ Load My Current Review
                    </button>
                    <button 
                      onClick={handleClearForm}
                      className={styles.clearFormBtn}
                    >
                      ＋ Write New Review
                    </button>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmitReview}>
                <div className={styles.formRow}>
                  <label>Rating:</label>
                  <div className={styles.ratingInput}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`${styles.starButton} ${star <= reviewForm.rating ? styles.selected : ''}`}
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <label>Title:</label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})}
                    placeholder="Summarize your experience"
                    required
                  />
                </div>
                
                <div className={styles.formRow}>
                  <label>Review:</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    placeholder="Share your thoughts about the product..."
                    rows={4}
                  />
                </div>
                
                <div className={styles.formRow}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={reviewForm.verified_purchase}
                      onChange={(e) => setReviewForm({...reviewForm, verified_purchase: e.target.checked})}
                    />
                    I purchased this product
                  </label>
                </div>
                
                <button 
                  type="submit" 
                  className={styles.submitReviewBtn}
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Saving...' : 
                   userReview ? 'Update Review' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
          
          {/* Reviews List */}
          <div className={styles.reviewsList}>
            {loadingReviews ? (
              <p>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className={styles.noReviews}>No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => {
                const isCurrentUserReview = user && review.user_email === user;
                return (
                  <div 
                    key={review.id} 
                    className={`${styles.reviewCard} ${isCurrentUserReview ? styles.userReviewCard : ''}`}
                  >
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewerInfo}>
                        <div className={styles.reviewerInitial}>
                          {review.user_email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <strong>
                            {review.user_email || 'Anonymous'}
                            {isCurrentUserReview && (
                              <span className={styles.yourReviewBadge}> (Your Review)</span>
                            )}
                          </strong>
                          {review.verified_purchase && (
                            <span className={styles.verifiedBadge}>✓ Verified Purchase</span>
                          )}
                        </div>
                      </div>
                      <div className={styles.reviewMeta}>
                        {renderStars(review.rating)}
                        <span className={styles.reviewDate}>
                          {new Date(review.created_at).toLocaleDateString()}
                          {review.created_at !== review.updated_at && ' (edited)'}
                        </span>
                      </div>
                    </div>
                    
                    <h4 className={styles.reviewTitle}>{review.title}</h4>
                    <p className={styles.reviewComment}>{review.comment}</p>
                    
                    {isCurrentUserReview && (
                      <div className={styles.reviewActions}>
                        <button 
                          onClick={() => {
                            setReviewForm({
                              rating: review.rating,
                              title: review.title,
                              comment: review.comment,
                              verified_purchase: review.verified_purchase
                            });
                            // Scroll to form
                            document.querySelector(`.${styles.reviewForm}`)?.scrollIntoView({ 
                              behavior: 'smooth' 
                            });
                          }}
                          className={styles.editReviewBtn}
                        >
                          ✎ Edit This Review
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}
    </div>
  );
}