import React, { useState, useEffect } from 'react';
// Use the new NGO-specific styles
import styles from './NgoDashboard.module.css';

function NgoDashboard() {
  // State for dashboard data
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
        // Fetch NGO details and received listings count in parallel
        const [detailsResponse, receivedResponse] = await Promise.all([
          fetch('/api/ngos/me', { // Fetch NGO details
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/foodlistings/myReceived', { // Fetch received listings
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        // Process details response
        if (!detailsResponse.ok) {
          const detailsErrorData = await detailsResponse.json().catch(() => ({}));
          throw new Error(detailsErrorData.message || 'Failed to fetch NGO details.');
        }
        const detailsData = await detailsResponse.json();
        setNgoDetails(detailsData);

        // Process received listings response
        if (!receivedResponse.ok) {
            const receivedErrorData = await receivedResponse.json().catch(() => ({}));
            throw new Error(receivedErrorData.message || 'Failed to fetch received donations count.');
        }
        const receivedData = await receivedResponse.json();
        setReceivedCount(receivedData.length); // Get count from array length

      } catch (err) {
        console.error('Error fetching NGO dashboard data:', err);
        setDataError(err.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []); // Runs once on mount

  return (
    // Reuse existing container style
    <div className={styles.dashboardContainer}>

      {/* Welcome Message and Stats */} 
      {isLoadingData ? (
        <p>Loading dashboard...</p>
      ) : dataError ? (
        <p className={styles.errorMessage}>{dataError}</p>
      ) : ngoDetails && (
        <div className={styles.welcomeSection}>
          {/* Adjust heading for NGO */}
          <h2>Welcome, {ngoDetails.name}!</h2> 
          {/* Adjust stats text for NGO */}
          <p className={styles.stats}>You have collected <strong>{receivedCount}</strong> donation{receivedCount !== 1 ? 's' : ''} so far.</p>
        </div>
      )}

      {/* Placeholder for other dashboard content if needed */}
      {/* For now, the main content will be on the /available page */}
      {!isLoadingData && !dataError && ngoDetails && (
         <p style={{ textAlign: 'center', marginTop: '2rem', color: '#555' }}>
            Select 'Available Food' from the menu to see current listings.
         </p>
      )}

    </div>
  );
}

export default NgoDashboard; 