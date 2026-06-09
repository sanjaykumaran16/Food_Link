import React, { useState, useEffect } from 'react';
import styles from './ProfilePage.module.css';
import { getMe } from '../services/authService';
import { getReviewsForUser, postReview } from '../services/reviewService';
import { downloadCertificate } from '../services/impactService';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setUser(me);
        const rev = await getReviewsForUser(me._id);
        setReviews(rev);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCertificate = async () => {
    try {
      const blob = await downloadCertificate(user._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'foodlink-impact.pdf';
      a.click();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <p className={styles.page}>Loading profile...</p>;
  if (!user) return <p className={styles.page}>{error || 'Not logged in'}</p>;

  return (
    <div className={styles.page}>
      <h2>Profile</h2>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.card}>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Phone:</strong> {user.phone || user.contactNumber}</p>
        <p><strong>Address:</strong> {user.address}</p>
        <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'Pending'}</p>
        <button type="button" className={styles.btn} onClick={handleCertificate}>Download impact certificate</button>
      </div>
      <h3>Reviews ({reviews.length})</h3>
      <ul className={styles.reviewList}>
        {reviews.map((r) => (
          <li key={r._id}>{r.rating}★ — {r.comment || 'No comment'} — {r.reviewer?.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default ProfilePage;
