import React, { useState, useEffect } from 'react';
import styles from './RestaurantReviews.module.css';
import { getRestaurantReviews } from '../services/reviewService';
import { FaStar, FaRegStar, FaStarHalfAlt, FaUserCircle, FaQuoteLeft } from 'react-icons/fa';

function StarRatingDisplay({ rating, size = 'md' }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className={`${styles.starRow} ${styles[`starRow_${size}`]}`}>
      {[...Array(fullStars)].map((_, i) => <FaStar key={`f${i}`} className={styles.starFull} />)}
      {hasHalf && <FaStarHalfAlt className={styles.starHalf} />}
      {[...Array(emptyStars)].map((_, i) => <FaRegStar key={`e${i}`} className={styles.starEmpty} />)}
    </span>
  );
}

function ReviewCard({ review }) {
  const formattedDate = new Date(review.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewerInfo}>
          {review.reviewer?.profilePhoto ? (
            <img
              src={review.reviewer.profilePhoto}
              alt={review.reviewer.name}
              className={styles.reviewerAvatar}
            />
          ) : (
            <div className={styles.reviewerAvatarPlaceholder}>
              <FaUserCircle />
            </div>
          )}
          <div>
            <p className={styles.reviewerName}>{review.reviewer?.name || 'Anonymous NGO'}</p>
            {review.listing?.title && (
              <p className={styles.reviewListingRef}>for "{review.listing.title}"</p>
            )}
          </div>
        </div>
        <div className={styles.reviewMeta}>
          <StarRatingDisplay rating={review.rating} size="sm" />
          <span className={styles.reviewDate}>{formattedDate}</span>
        </div>
      </div>

      {review.comment && (
        <div className={styles.reviewBody}>
          <FaQuoteLeft className={styles.quoteIcon} />
          <p className={styles.reviewComment}>{review.comment}</p>
        </div>
      )}
    </div>
  );
}

function RestaurantReviews() {
  const [data, setData] = useState({ reviews: [], avgRating: null, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Could not determine your user ID. Please log in again.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const result = await getRestaurantReviews(userId);
        setData(result);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { reviews, avgRating, totalCount } = data;

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Your Reviews</h2>
        <p className={styles.pageSubtitle}>
          NGOs who have received your donations can leave reviews after a completed pickup.
        </p>
      </div>

      {loading && (
        <div className={styles.loadingGrid}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonRow}>
                <div className={styles.skeletonCircle} />
                <div className={styles.skeletonLines}>
                  <div className={styles.skeletonLine} style={{ width: '40%' }} />
                  <div className={styles.skeletonLine} style={{ width: '60%' }} />
                </div>
              </div>
              <div className={styles.skeletonLine} style={{ width: '90%', marginTop: '1rem' }} />
              <div className={styles.skeletonLine} style={{ width: '75%' }} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className={styles.errorBox}>
          <span>⚠️</span> {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Summary Banner */}
          <div className={styles.summaryBanner}>
            {avgRating !== null ? (
              <>
                <div className={styles.avgRatingBlock}>
                  <span className={styles.avgRatingNumber}>{avgRating.toFixed(1)}</span>
                  <div>
                    <StarRatingDisplay rating={avgRating} size="lg" />
                    <p className={styles.avgRatingLabel}>
                      Based on <strong>{totalCount}</strong> review{totalCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className={styles.ratingBreakdown}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                    return (
                      <div key={star} className={styles.breakdownRow}>
                        <span className={styles.breakdownLabel}>{star} ★</span>
                        <div className={styles.breakdownBar}>
                          <div
                            className={styles.breakdownFill}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={styles.breakdownCount}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className={styles.noRatingYet}>
                <span className={styles.noRatingIcon}>⭐</span>
                <div>
                  <p className={styles.noRatingTitle}>No reviews yet</p>
                  <p className={styles.noRatingSubtitle}>
                    Your rating will appear here once NGOs review completed donations.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className={styles.reviewsList}>
              {reviews.map((r) => (
                <ReviewCard key={r._id} review={r} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🌟</div>
              <h3>No reviews yet</h3>
              <p>
                Keep donating! NGOs can leave reviews after receiving and completing a delivery.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RestaurantReviews;
