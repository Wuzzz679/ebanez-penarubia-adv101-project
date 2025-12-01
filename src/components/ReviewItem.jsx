// components/ReviewItem.jsx
import { useState, useEffect } from 'react';
import ReplyForm from './ReplyForm';
import styles from '../styles/ReviewItem.module.css';

export default function ReviewItem({ review, userEmail }) {
  const [replies, setReplies] = useState([]);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [error, setError] = useState('');

  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch replies for this review
  const fetchReplies = async () => {
    setLoadingReplies(true);
    setError('');
    
    try {
      const response = await fetch(`/api/review-replies?reviewId=${review.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch replies');
      }
      
      const data = await response.json();
      setReplies(data);
    } catch (error) {
      console.error('Error fetching replies:', error);
      setError('Could not load replies. Please try again.');
    } finally {
      setLoadingReplies(false);
    }
  };

  // Handle toggling replies visibility
  const toggleReplies = () => {
    if (!showReplies && replies.length === 0) {
      fetchReplies();
    }
    setShowReplies(!showReplies);
  };

  // Handle new reply submission
  const handleReplySubmit = (newReply) => {
    if (newReply) {
      setReplies(prev => [...prev, newReply]);
    }
    setShowReplyForm(false);
  };

  // Show verified purchase badge
  const VerifiedBadge = () => (
    <span className={styles.verifiedBadge}>
      ✓ Verified Purchase
    </span>
  );

  // Render star rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={index < rating ? styles.starFilled : styles.starEmpty}
      >
        ★
      </span>
    ));
  };

  return (
    <div className={styles.reviewItem}>
      {/* Review Header */}
      <div className={styles.reviewHeader}>
        <div className={styles.userInfo}>
          <div className={styles.nameAndBadge}>
            <span className={styles.userName}>
              {review.user_name || review.user_email}
            </span>
            {review.verified_purchase && <VerifiedBadge />}
          </div>
          <span className={styles.date}>
            {formatDate(review.created_at)}
          </span>
        </div>
        
        <div className={styles.rating}>
          {renderStars(review.rating)}
          <span className={styles.ratingText}>
            {review.rating}.0 out of 5
          </span>
        </div>
      </div>

      {/* Review Title & Comment */}
      {review.title && (
        <h4 className={styles.reviewTitle}>{review.title}</h4>
      )}
      
      <p className={styles.comment}>{review.comment}</p>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className={styles.replyButton}
          disabled={!userEmail}
          title={!userEmail ? "Please login to reply" : ""}
        >
          ✍️ Reply
        </button>
        
        {replies.length > 0 && (
          <button
            onClick={toggleReplies}
            className={styles.toggleRepliesButton}
          >
            {showReplies ? '▼ Hide' : '▶ Show'} Replies ({replies.length})
          </button>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className={styles.replyFormContainer}>
          <ReplyForm
            reviewId={review.id}
            userEmail={userEmail}
            onSubmit={handleReplySubmit}
          />
        </div>
      )}

      {/* Replies List */}
      {showReplies && (
        <div className={styles.repliesContainer}>
          <div className={styles.repliesHeader}>
            <h5>Replies ({replies.length})</h5>
          </div>
          
          {loadingReplies ? (
            <div className={styles.loading}>
              Loading replies...
            </div>
          ) : error ? (
            <div className={styles.error}>
              {error}
            </div>
          ) : replies.length === 0 ? (
            <div className={styles.noReplies}>
              No replies yet. Be the first to reply!
            </div>
          ) : (
            <div className={styles.repliesList}>
              {replies.map((reply) => (
                <div key={reply.id} className={styles.replyItem}>
                  <div className={styles.replyHeader}>
                    <div>
                      <span className={styles.replyUser}>
                        {reply.user_email}
                      </span>
                      <span className={styles.replyDate}>
                        {formatDate(reply.created_at)}
                      </span>
                    </div>
                  </div>
                  <p className={styles.replyComment}>{reply.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}