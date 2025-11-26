"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/reviews.module.css";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(storedUser);
      fetchUserReviews(storedUser);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserReviews = async (userEmail) => {
    try {
      setLoading(true);
      
      if (!userEmail) {
        setReviews([]);
        return;
      }

      const response = await fetch(`/api/reviews/user?user_email=${userEmail}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    setDeletingId(reviewId);

    try {
      const response = await fetch('/api/reviews/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          review_id: reviewId,
          user_email: user
        }),
      });

      const data = await response.json();

      if (data.success) {
        setReviews(prev => prev.filter(review => review.id !== reviewId));
        alert("Review deleted successfully!");
      } else {
        alert(data.message || "Failed to delete review");
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert("Failed to delete review. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // FIXED: Correct routes for your file structure
  const handleBackToHome = () => {
    router.push("/home"); // Goes to home.jsx
  };

  const handleStartShopping = () => {
    router.push("/home"); // Goes to home.jsx
  };

  const handleLogin = () => {
    router.push("/"); // Goes to index.jsx (your login page)
  };

  const renderStars = (rating) => {
    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <div className={styles.pageContainer}>
        <header className={styles.pageHeader}>
          <button className={styles.backButton} onClick={handleBackToHome}>
            ← Back to Home
          </button>
          <h1>My Reviews</h1>
          <p>Please log in to view your reviews</p>
          <button 
            className={styles.loginButton}
            onClick={handleLogin}
          >
            Login
          </button>
        </header>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <button className={styles.backButton} onClick={handleBackToHome}>
          ← Back to Home
        </button>
        <h1>My Reviews</h1>
        <p>Reviews you've submitted for products</p>
      </header>

      <div className={styles.reviewsStats}>
        <div className={styles.statCard}>
          <h3>{reviews.length}</h3>
          <p>Total Reviews</p>
        </div>
        <div className={styles.statCard}>
          <h3>
            {reviews.length > 0 
              ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
              : '0'
            }
          </h3>
          <p>Average Rating</p>
        </div>
      </div>

      <div className={styles.reviewsList}>
        {loading ? (
          <div className={styles.loading}>Loading your reviews...</div>
        ) : reviews.length === 0 ? (
          <div className={styles.noReviews}>
            <h3>No Reviews Yet</h3>
            <p>You haven't reviewed any products yet.</p>
            <button 
              className={styles.shopButton}
              onClick={handleStartShopping}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                  <div className={styles.reviewerName}>
                    {review.user_name || review.user_email?.split('@')[0] || 'You'}
                  </div>
                  <div className={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className={styles.reviewRating}>
                  {renderStars(review.rating)}
                  <span className={styles.ratingText}>{review.rating} out of 5</span>
                </div>
              </div>
              
              <h3 className={styles.reviewTitle}>{review.title}</h3>
              <p className={styles.reviewComment}>{review.comment}</p>
              
              <div className={styles.reviewMeta}>
                {review.verified_purchase && (
                  <span className={styles.verifiedBadge}>✓ Verified Purchase</span>
                )}
                {review.product_name && (
                  <span 
                    className={styles.productLink}
                    onClick={() => router.push(`/shoe/${review.product_slug}`)}
                  >
                    Product: {review.product_name}
                  </span>
                )}
              </div>

              <div className={styles.reviewActions}>
                <button 
                  className={styles.deleteButton}
                  onClick={() => handleDeleteReview(review.id)}
                  disabled={deletingId === review.id}
                >
                  {deletingId === review.id ? "Deleting..." : "Delete Review"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}