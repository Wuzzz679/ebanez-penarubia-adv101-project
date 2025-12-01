// components/ReplyForm.jsx
import { useState } from 'react';
import styles from '../styles/ReplyForm.module.css';

export default function ReplyForm({ reviewId, onSubmit, userEmail }) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!comment.trim()) {
      setError('Please write a reply');
      return;
    }

    if (!userEmail) {
      setError('Please log in to reply');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // Send POST request to our API
      const response = await fetch('/api/review-replies', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          review_id: reviewId,
          user_email: userEmail,
          comment: comment.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post reply');
      }

      // Clear form and call parent's onSubmit
      setComment('');
      if (onSubmit) {
        onSubmit(data); // Pass the new reply data back
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setComment('');
    setError('');
    if (onSubmit) {
      onSubmit(null); // Signal cancellation
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.replyForm}>
      <h4 className={styles.title}>Write a Reply</h4>
      
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Type your reply here..."
        className={styles.textarea}
        rows="3"
        required
        disabled={isSubmitting}
      />
      
      {error && (
        <div className={styles.error}>
          ⚠️ {error}
        </div>
      )}
      
      <div className={styles.actions}>
        <button
          type="button"
          onClick={handleCancel}
          className={styles.cancelButton}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className={styles.submitButton}
        >
          {isSubmitting ? 'Posting...' : 'Post Reply'}
        </button>
      </div>
    </form>
  );
}