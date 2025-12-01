// pages/reviews.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ReviewItem from '../components/ReviewItem';
import styles from '../styles/reviews.module.css';

// Your shoes data - you might want to move this to a separate file
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

export default function ReviewsPage() {
  const router = useRouter();
  const { productId } = router.query;
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userReview, setUserReview] = useState(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    verified_purchase: false
  });
  
  // Load user email from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUserEmail(userData.email || userData.username || savedUser);
      } catch (error) {
        setUserEmail(savedUser);
      }
    }
  }, []);
  
  // Load product info and reviews when productId changes
  useEffect(() => {
    if (productId) {
      loadProductAndReviews();
    } else {
      // If no productId, just show product selection
      setLoading(false);
      setSelectedProduct(null);
      setReviews([]);
      setUserReview(null);
    }
  }, [productId, userEmail]);
  
  const loadProductAndReviews = async () => {
    try {
      setLoading(true);
      
      // Find the product from your data
      const product = shoesData.find(p => p.id === parseInt(productId));
      if (!product) {
        setSelectedProduct(null);
        setReviews([]);
        return;
      }
      
      setSelectedProduct(product);
      
      // Fetch reviews for this product
      const response = await fetch(`/api/reviews?productId=${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
        calculateStats(data.reviews);
        
        // Check if current user has a review
        if (userEmail) {
          const existingUserReview = data.reviews.find(review => review.user_email === userEmail);
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
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateStats = (reviews) => {
    if (!reviews || reviews.length === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
      return;
    }
    
    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });
    
    setStats({
      averageRating: average.toFixed(1),
      totalReviews: total,
      ratingDistribution: distribution
    });
  };
  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!userEmail) {
      alert('Please login to submit a review');
      return;
    }
    
    if (!reviewForm.title.trim()) {
      alert('Please enter a review title');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const reviewData = {
        product_id: productId,
        user_email: userEmail,
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
            title: '',
            comment: '',
            verified_purchase: false
          });
        }
        
        // Refresh reviews
        loadProductAndReviews();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleProductSelect = (product) => {
    router.push(`/reviews?productId=${product.id}`);
  };
  
  const handleClearForm = () => {
    setReviewForm({
      rating: 5,
      title: '',
      comment: '',
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
    const numericRating = parseFloat(rating) || 0;
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
  
  if (loading) {
    return (
      <div className={styles.container}>
        <h1>Loading Reviews...</h1>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <h1>Product Reviews</h1>
      
      {/* Login Notice */}
      {!userEmail && (
        <div className={styles.loginNotice}>
          <p>
            Please <Link href="/login">log in</Link> to write reviews and reply to existing ones.
          </p>
        </div>
      )}
      
      {/* Product Selection (if no productId) */}
      {!productId && (
        <div className={styles.productSelection}>
          <h2>Select a Product to Review</h2>
          <p className={styles.selectionHint}>Choose a product below to see reviews or write your own review.</p>
          <div className={styles.productGrid}>
            {shoesData.map((product) => (
              <div 
                key={product.id} 
                className={styles.productCard}
                onClick={() => handleProductSelect(product)}
              >
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className={styles.productImage}
                />
                <div className={styles.productInfo}>
                  <h3>{product.name}</h3>
                  <p className={styles.productPrice}>{product.price}</p>
                  <button className={styles.selectProductBtn}>
                    View/Write Reviews
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Product Info and Reviews (if productId exists) */}
      {productId && selectedProduct && (
        <>
          <div className={styles.productHeader}>
            <div className={styles.productInfo}>
              <img 
                src={selectedProduct.images[0]} 
                alt={selectedProduct.name} 
                className={styles.selectedProductImage}
              />
              <div className={styles.productDetails}>
                <h2>{selectedProduct.name}</h2>
                <p className={styles.productDescription}>{selectedProduct.description}</p>
                <p className={styles.productPriceLarge}>{selectedProduct.price}</p>
                <div className={styles.productActions}>
                  <Link href={`/shoe/${selectedProduct.slug}`} className={styles.backToProduct}>
                    ← View Product Details
                  </Link>
                  <button 
                    onClick={() => router.push('/reviews')}
                    className={styles.reviewOtherBtn}
                  >
                    ← Review Other Products
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Review Stats */}
          <div className={styles.statsSection}>
            <div className={styles.overallRating}>
              <h2>{stats.averageRating}</h2>
              <div>{renderStars(stats.averageRating)}</div>
              <p>{stats.totalReviews} reviews</p>
            </div>
            
            <div className={styles.ratingBreakdown}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className={styles.ratingBar}>
                  <span className={styles.ratingLabel}>{rating} star</span>
                  <div className={styles.barContainer}>
                    <div 
                      className={styles.bar} 
                      style={{ 
                        width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[rating] / stats.totalReviews) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className={styles.ratingCount}>{stats.ratingDistribution[rating]}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Review Form */}
          <div className={styles.reviewForm}>
            <h2>Write a Review</h2>
            
            {/* User Review Notice */}
            {userReview && userEmail && (
              <div className={styles.userReviewNotice}>
                <div className={styles.noticeHeader}>
                  <span className={styles.noticeIcon}>✎</span>
                  <strong>You've already reviewed this product</strong>
                </div>
                <p>Editing will update your existing review from {new Date(userReview.created_at).toLocaleDateString()}</p>
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
              <div className={styles.formGroup}>
                <label>Your Rating *</label>
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
              
              <div className={styles.formGroup}>
                <label>Review Title *</label>
                <input
                  type="text"
                  name="title"
                  value={reviewForm.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Summarize your experience"
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Your Review</label>
                <textarea
                  name="comment"
                  value={reviewForm.comment}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Share your thoughts about the product..."
                  className={styles.formTextarea}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="verified_purchase"
                    checked={reviewForm.verified_purchase}
                    onChange={handleInputChange}
                  />
                  I purchased this product
                </label>
              </div>
              
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={submitting || !userEmail}
              >
                {!userEmail ? 'Please Login to Review' : 
                 submitting ? 'Saving...' : 
                 userReview ? 'Update Review' : 'Submit Review'}
              </button>
            </form>
          </div>
          
          {/* Reviews List */}
          <div className={styles.reviewsList}>
            <h2>Customer Reviews ({stats.totalReviews})</h2>
            
            {reviews.length === 0 ? (
              <div className={styles.noReviews}>
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              <div className={styles.reviewsContainer}>
                {reviews.map((review) => (
                  <ReviewItem
                    key={review.id}
                    review={review}
                    userEmail={userEmail}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Show error if product not found */}
      {productId && !selectedProduct && !loading && (
        <div className={styles.errorMessage}>
          <p>Product not found. The product ID might be incorrect.</p>
          <button 
            onClick={() => router.push('/reviews')}
            className={styles.backButton}
          >
            ← Back to Product Selection
          </button>
        </div>
      )}
    </div>
  );
}