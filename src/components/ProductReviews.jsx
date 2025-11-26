"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/reviews.module.css";
 

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
    product_id: productId
  });

  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser);
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?product_id=${productId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
      } else {
        console.error('Error fetching reviews:', data.message);
        // Fallback to empty array if API fails
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Fallback to empty array if API fails
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setReviewForm(prev => ({
      ...prev,
      rating: rating
    }));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please login to submit a review");
      router.push("/login");
      return;
    }

    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
      alert("Please fill in both title and comment");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reviewForm,
          user_email: user
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      if (data.success) {

        setReviews(prev => [data.review, ...prev]);
        

        setReviewForm({
          rating: 5,
          title: "",
          comment: "",
          product_id: productId
        });
        
        setShowReviewForm(false);
        alert("Review submitted successfully!");
      } else {
        alert(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const hasUserReviewed = () => {
    if (!user) return false;
    return reviews.some(review => review.user_email === user);
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "span"}
            className={`${styles.star} ${star <= rating ? styles.filled : ''} ${interactive ? styles.interactive : ''}`}
            onClick={interactive ? () => handleRatingChange(star) : undefined}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const averageRating = calculateAverageRating();
  const totalReviews = reviews.length;

  return (
    <div className={styles.reviewsContainer}>
      <div className={styles.reviewsHeader}>
        <h2>Customer Reviews</h2>
        <div className={styles.reviewsSummary}>
          <div className={styles.averageRating}>
            <div className={styles.averageScore}>{averageRating}</div>
            <div className={styles.averageStars}>
              {renderStars(Math.round(averageRating))}
              <span>{totalReviews} reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Write Review Button - Only for logged-in users who haven't reviewed */}
      {user && !hasUserReviewed() && (
        <div className={styles.writeReviewSection}>
          <button 
            className={styles.writeReviewBtn}
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            {showReviewForm ? "Cancel Review" : "Write a Review"}
          </button>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={submitReview} className={styles.reviewForm}>
          <h3>Write Your Review</h3>
          
          <div className={styles.formGroup}>
            <label>Rating</label>
            <div className={styles.ratingInput}>
              {renderStars(reviewForm.rating, true)}
              <span>{reviewForm.rating} out of 5 stars</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title">Review Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={reviewForm.title}
              onChange={handleInputChange}
              placeholder="Summarize your experience"
              required
              maxLength="100"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="comment">Your Review *</label>
            <textarea
              id="comment"
              name="comment"
              value={reviewForm.comment}
              onChange={handleInputChange}
              rows="5"
              placeholder="Share details of your experience with this product..."
              required
              maxLength="1000"
            />
            <div className={styles.charCount}>
              {reviewForm.comment.length}/1000 characters
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {/* User Already Reviewed Message */}
      {user && hasUserReviewed() && (
        <div className={styles.alreadyReviewed}>
          <p>You have already reviewed this product. Thank you for your feedback!</p>
        </div>
      )}

      {/* Reviews List */}
      <div className={styles.reviewsList}>
        {loading ? (
          <div className={styles.loading}>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className={styles.noReviews}>
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                  <div className={styles.reviewerName}>
                    {review.user_name || review.user_email?.split('@')[0] || 'Anonymous'}
                  </div>
                  <div className={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className={styles.reviewRating}>
                  {renderStars(review.rating)}
                </div>
              </div>
              
              <h4 className={styles.reviewTitle}>{review.title}</h4>
              <p className={styles.reviewComment}>{review.comment}</p>
              
              {review.verified_purchase && (
                <div className={styles.verifiedBadge}>
                  ✓ Verified Purchase
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}