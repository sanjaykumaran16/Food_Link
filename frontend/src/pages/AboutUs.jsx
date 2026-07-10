import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AboutUs.module.css';
import { FaBuilding, FaHandsHelping, FaUtensils } from 'react-icons/fa';

function AboutUs() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ restaurants: 0, ngos: 0, donations: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Failed to fetch statistics');
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
      <h1 className={styles.title}>{t('about.title')}</h1>

      <section className={styles.purposeSection}>
        <h2>{t('about.missionTitle')}</h2>
        <div className={styles.contentCard}>
          <p>{t('about.missionP1')}</p>
          <p>{t('about.missionP2')}</p>
        </div>
      </section>

      <section className={styles.statsSection}>
        <h2>{t('about.impactTitle')}</h2>
        {loading && <p>{t('about.loadingStats')}</p>}
        {error && <p className={styles.error}>Error: {error}</p>}
        {!loading && !error && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <FaBuilding className={styles.statIcon} />
              <span className={styles.statNumber}>{stats.restaurants}</span>
              <span className={styles.statLabel}>{t('about.registeredRestaurants')}</span>
            </div>
            <div className={styles.statCard}>
              <FaHandsHelping className={styles.statIcon} />
              <span className={styles.statNumber}>{stats.ngos}</span>
              <span className={styles.statLabel}>{t('about.registeredNgos')}</span>
            </div>
            <div className={styles.statCard}>
              <FaUtensils className={styles.statIcon} />
              <span className={styles.statNumber}>{stats.donations}</span>
              <span className={styles.statLabel}>{t('about.donationsCompleted')}</span>
            </div>
          </div>
        )}
      </section>

      <section className={styles.howItWorksSection}>
        <h2>{t('about.howTitle')}</h2>
        <div className={styles.contentCard}>
          <ol>
            <li>{t('about.step1')}</li>
            <li>{t('about.step2')}</li>
            <li>{t('about.step3')}</li>
            <li>{t('about.step4')}</li>
          </ol>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;