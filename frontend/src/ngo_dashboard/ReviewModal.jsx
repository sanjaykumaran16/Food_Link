import React, { useState } from 'react';
import styles from './ReviewModal.module.css';
import { postReview } from '../services/reviewService';
import { FaStar, FaTimes } from 'react-icons/fa';

function StarRating({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className={styles.starRow} aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.starBtn} ${(hovered || value) >= star ? styles.starActive : ''}`}
          onClick={() => !disabled && onChange(star)}
          onMouseEnter={() => !disabled && setHovered(star)}
          onMouseLeave={() => !disabled && setHovered(0)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          disabled={disabled}
        >
          <FaStar />
        </button>
      ))}
      <span className={styles.ratingLabel}>
        {value ? ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value] : 'Select rating'}
      </span>
    </div>
  );
}

function ReviewModal({ listingId, restaurantId, restaurantName, listingTitle, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!rating) {
      setError('Please select a star rating before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      await postReview({ reviewee: restaurantId, listing: listingId, rating, comment });
      setSuccess(true);
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Leave a review">
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close review modal">
          <FaTimes />
        </button>

        {success ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>✅</div>
            <h3>Thank you!</h3>
            <p>Your review has been submitted successfully.</p>
          </div>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <div className={styles.headerIcon}>⭐</div>
              <div>
                <h3 className={styles.modalTitle}>Rate Your Experience</h3>
                <p className={styles.modalSubtitle}>
                  Reviewing <strong>{restaurantName}</strong> for <em>{listingTitle}</em>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Your Rating</label>
                <StarRating value={rating} onChange={setRating} disabled={submitting} />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="review-comment">
                  Comments <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  id="review-comment"
                  className={styles.textarea}
                  placeholder="Share your experience — food quality, freshness, packaging, communication..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={500}
                  disabled={submitting}
                />
                <span className={styles.charCount}>{comment.length}/500</span>
              </div>

              {error && <p className={styles.errorMsg} role="alert">{error}</p>}

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting || !rating}
                >
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ReviewModal;
