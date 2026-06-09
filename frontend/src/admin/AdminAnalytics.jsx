import React, { useState, useEffect } from 'react';
import styles from './AdminAnalytics.module.css';
import { getAnalytics } from '../services/adminService';

function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <h2>Platform Analytics</h2>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? <p>Loading...</p> : (
        <pre className={styles.pre}>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}

export default AdminAnalytics;
