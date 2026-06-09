import React, { useState, useEffect } from 'react';
import styles from './RestaurantAnalytics.module.css';
import { getMe } from '../services/authService';
import { getRestaurantImpact } from '../services/impactService';

function RestaurantAnalytics() {
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadImpact = async () => {
    setLoading(true);
    setError('');
    try {
      const me = await getMe();
      const data = await getRestaurantImpact(me._id);
      setImpact(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImpact();
    const onFocus = () => loadImpact();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <h2>Donation Analytics</h2>
      <p className={styles.subtitle}>
        Impact from donations collected by NGOs (claimed or delivered).
      </p>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span>Total collected</span>
            <strong>{impact?.count || 0}</strong>
          </div>
          <div className={styles.statCard}>
            <span>Awaiting pickup</span>
            <strong>{impact?.claimed || 0}</strong>
          </div>
          <div className={styles.statCard}>
            <span>Delivered</span>
            <strong>{impact?.completed || 0}</strong>
          </div>
          <div className={styles.statCard}>
            <span>Meals provided</span>
            <strong>{impact?.totalMeals || 0}</strong>
          </div>
          <div className={styles.statCard}>
            <span>Kg rescued</span>
            <strong>{impact?.totalKg || 0}</strong>
          </div>
          <div className={styles.statCard}>
            <span>CO₂ saved (kg)</span>
            <strong>{impact?.totalCo2 || 0}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantAnalytics;
