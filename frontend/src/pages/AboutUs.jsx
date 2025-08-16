import React, { useState, useEffect } from 'react';
import styles from './AboutUs.module.css'; // Create this CSS module
import { FaBuilding, FaHandsHelping, FaUtensils } from 'react-icons/fa';

function AboutUs() {
  const [stats, setStats] = useState({ restaurants: 0, ngos: 0, donations: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err.message || 'Could not load statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className={styles.aboutContainer}>
              <h1 className={styles.title}>About Food Link</h1>
      
      <section className={styles.purposeSection}>
        <h2>Our Mission</h2>
        <div className={styles.contentCard}>
          <p>
            We aim to bridge the gap between restaurants with surplus food and NGOs dedicated to feeding the needy.
            Our platform facilitates the efficient donation of edible, unsold food, reducing waste and fighting hunger
            within our community.
          </p>
          <p>
            By connecting donors and recipients seamlessly, we strive to create a sustainable ecosystem where 
            no good food goes to waste and more people have access to nutritious meals.
          </p>
        </div>
      </section>

      <section className={styles.statsSection}>
        <h2>Our Impact So Far</h2>
        {loading && <p>Loading statistics...</p>}
        {error && <p className={styles.error}>Error: {error}</p>}
        {!loading && !error && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <FaBuilding className={styles.statIcon} />
              <span className={styles.statNumber}>{stats.restaurants}</span>
              <span className={styles.statLabel}>Registered Restaurants</span>
            </div>
            <div className={styles.statCard}>
              <FaHandsHelping className={styles.statIcon} />
              <span className={styles.statNumber}>{stats.ngos}</span>
              <span className={styles.statLabel}>Registered NGOs</span>
            </div>
            <div className={styles.statCard}>
              <FaUtensils className={styles.statIcon} />
              <span className={styles.statNumber}>{stats.donations}</span>
              <span className={styles.statLabel}>Donations Completed</span>
            </div>
          </div>
        )}
      </section>

      <section className={styles.howItWorksSection}>
        <h2>How It Works</h2>
        <div className={styles.contentCard}>
          <ol>
              <li>Restaurants list surplus food items nearing their expiry.</li>
              <li>Registered NGOs browse available donations in their vicinity.</li>
              <li>NGOs claim listings they can collect and distribute.</li>
              <li>Food reaches those in need, preventing waste.</li>
          </ol>
        </div>
      </section>

    </div>
  );
}

export default AboutUs; 