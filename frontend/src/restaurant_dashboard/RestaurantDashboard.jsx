import React, { useState, useEffect } from 'react';
import styles from './RestaurantDashboard.module.css'; // Import the CSS module
import {
  FaUtensils, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaPhoneAlt,
  FaCheckCircle, // Icon for Collected
  FaListAlt,     // Icon for Available
  FaTimesCircle,  // Icon for Expired
  FaInfoCircle,   // Icon for general info
  FaTimes,        // Icon for close button
  FaClock         // Added Clock icon
} from 'react-icons/fa'; // Import icons

function RestaurantDashboard() {
  // State for dashboard data
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  // const [listingsCount, setListingsCount] = useState(0); // Keep or remove based on final design
  const [listingCounts, setListingCounts] = useState({ collected: 0, available: 0, expired: 0 }); // New state for counts
  const [isLoadingData, setIsLoadingData] = useState(true); // Loading state for dashboard data
  const [dataError, setDataError] = useState('');
  const [showLoginNotification, setShowLoginNotification] = useState(true); // State to control login notification visibility

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      setDataError('');
      const token = localStorage.getItem('restaurantToken');

      if (!token) {
        setDataError('Could not find your login. Please sign in again.');
        setIsLoadingData(false);
        return;
      }

      try {
        const response = await fetch('/api/restaurants/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Could not load your dashboard.');
        }
        const data = await response.json();

        setRestaurantDetails(data);
        setListingCounts(
          data.listingCounts || { collected: 0, available: 0, expired: 0 }
        );
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setDataError(err.message || 'Could not load your dashboard.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
    const onFocus = () => fetchData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const unreadCount = restaurantDetails?.unreadNotificationCount || 0;

  // Main render logic
  return (
    <div className={styles.dashboardContainer}>

      {/* Login Notification - Show if unread count > 0 and not dismissed */}
      {!isLoadingData && unreadCount > 0 && showLoginNotification && (
        <div className={`${styles.loginNotificationBox} ${styles.infoBox}`}> {/* Use specific class + generic */}
            <span className={styles.boxIcon}><FaInfoCircle /></span>
            <p>
                You have <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? 's' : ''}. 
                Check your <a href="/restaurant/dashboard/notifications" onClick={() => setShowLoginNotification(false)}>notifications</a>.
            </p>
            <button 
                className={styles.closeBoxButton}
                onClick={() => setShowLoginNotification(false)} // Dismiss on click
                aria-label="Dismiss notification"
            >
                <FaTimes />
            </button>
        </div>
      )}

      {/* Welcome Message */}
      {isLoadingData ? (
        <p className={styles.loadingMessage}>Just a moment, we're loading your dashboard...</p>
      ) : dataError ? (
        <p className={styles.errorMessage}>{dataError}</p>
      ) : restaurantDetails && (
        <div className={styles.welcomeSection}>
          <h2>Hi {restaurantDetails.name}, welcome back!</h2>
          {/* Optional: Display total listings or other stats here */}
          {/* <p className={styles.stats}>You have added <strong>{listingsCount}</strong> food listing{listingsCount !== 1 ? 's' : ''} so far.</p> */}
        </div>
      )}

      {/* --- Listing Stats Cards --- */}
      {!isLoadingData && !dataError && restaurantDetails && (
          <div className={styles.statsCardsContainer}>
            
            {/* Card 1: Collected Listings */}
            <div className={`${styles.statCard} ${styles.collectedCard}`}>
              <div className={styles.cardIcon}><FaCheckCircle /></div>
              <div className={styles.cardContent}>
                <span className={styles.cardNumber}>{listingCounts.collected}</span>
                <span className={styles.cardLabel}>Claimed</span>
              </div>
            </div>

            {/* Card 2: Available Listings */}
            <div className={`${styles.statCard} ${styles.availableCard}`}>
               <div className={styles.cardIcon}><FaListAlt /></div>
              <div className={styles.cardContent}>
                <span className={styles.cardNumber}>{listingCounts.available}</span>
                <span className={styles.cardLabel}>Available</span>
              </div>
            </div>

            {/* Card 3: Expired Listings */}
            <div className={`${styles.statCard} ${styles.expiredCard}`}>
               <div className={styles.cardIcon}><FaTimesCircle /></div>
              <div className={styles.cardContent}>
                <span className={styles.cardNumber}>{listingCounts.expired}</span>
                <span className={styles.cardLabel}>Expired</span>
              </div>
            </div>

          </div>
      )}

      {/* Restaurant Details Section (If you want to keep it) */}
      {!isLoadingData && !dataError && restaurantDetails && (
        <>
        <hr className={styles.divider} /> 
        <div className={styles.detailsSection}>
            <h3>Your Restaurant Info</h3>
            <p><span className={styles.detailIcon}><FaUtensils /></span><strong>Name:</strong> {restaurantDetails.name}</p>
            <p><span className={styles.detailIcon}><FaEnvelope /></span><strong>Email:</strong> {restaurantDetails.email}</p>
            <p><span className={styles.detailIcon}><FaMapMarkerAlt /></span><strong>Address:</strong> {restaurantDetails.address}</p>
            <p><span className={styles.detailIcon}><FaPhoneAlt /></span><strong>Contact:</strong> {restaurantDetails.contactNumber}</p>
        </div>
        </>
      )}

    </div>
  );
}

export default RestaurantDashboard; 