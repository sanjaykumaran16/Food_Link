import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './NgoDashboard.module.css';

function NgoDashboard() {
  const { t } = useTranslation();
  const [ngoDetails, setNgoDetails] = useState(null);
  const [receivedCount, setReceivedCount] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      setDataError('');
      const token = localStorage.getItem('ngoToken');
      if (!token) {
        setDataError('Authentication token not found. Please log in again.');
        setIsLoadingData(false);
        return;
      }
      try {
        const detailsResponse = await fetch('/api/ngos/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!detailsResponse.ok) {
          const detailsErrorData = await detailsResponse.json().catch(() => ({}));
          throw new Error(detailsErrorData.message || 'Failed to fetch NGO details.');
        }
        const detailsData = await detailsResponse.json();
        setNgoDetails(detailsData);
        setReceivedCount(detailsData.receivedCount ?? 0);
      } catch (err) {
        console.error('Error fetching NGO dashboard data:', err);
        setDataError(err.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      {isLoadingData ? (
        <p>Loading dashboard...</p>
      ) : dataError ? (
        <p className={styles.errorMessage}>{dataError}</p>
      ) : ngoDetails && (
        <div className={styles.welcomeSection}>
          <h2>{t('dashboard.ngoWelcome', { name: ngoDetails.name })}</h2>
          <p
            className={styles.stats}
            dangerouslySetInnerHTML={{ __html: t('dashboard.ngoStats', { count: receivedCount }) }}
          />
        </div>
      )}
      {!isLoadingData && !dataError && ngoDetails && (
        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#555' }}>
          {t('dashboard.selectAvailable')}
        </p>
      )}
    </div>
  );
}

export default NgoDashboard;