import React from 'react';
import styles from './MatchScoreBadge.module.css';
import { FaStar, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';

function MatchScoreBadge({ listing }) {
  const { matchScore, urgencyLevel, urgencyScore, distanceKm, safetyWarnings } = listing;

  if (matchScore == null && urgencyScore == null) return null;

  const urgencyClass =
    urgencyLevel === 'critical'
      ? styles.critical
      : urgencyLevel === 'high'
        ? styles.high
        : urgencyLevel === 'medium'
          ? styles.medium
          : styles.low;

  return (
    <div className={styles.badges}>
      {matchScore != null && (
        <span className={styles.matchBadge} title="Smart match score based on distance, urgency, capacity, and preferences">
          <FaStar /> Match {matchScore}%
        </span>
      )}
      {urgencyLevel && (
        <span className={`${styles.urgencyBadge} ${urgencyClass}`}>
          <FaExclamationTriangle /> {urgencyLevel} urgency
        </span>
      )}
      {distanceKm != null && (
        <span className={styles.distanceBadge}>{distanceKm} km away</span>
      )}
      {listing.safetyStatus === 'verified' && (
        <span className={styles.safetyBadge}>
          <FaShieldAlt /> Safety verified
        </span>
      )}
      {safetyWarnings?.length > 0 && (
        <span className={styles.warningBadge} title={safetyWarnings.join('; ')}>
          {safetyWarnings.length} safety note{safetyWarnings.length !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}

export default MatchScoreBadge;
