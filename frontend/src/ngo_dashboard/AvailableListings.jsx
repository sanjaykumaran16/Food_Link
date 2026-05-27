import React, { useState, useEffect } from 'react';
import styles from './AvailableListings.module.css';
import { FaSearch, FaUtensils, FaCalendarAlt, FaBuilding, FaMapMarkerAlt, FaPhoneAlt, FaHandPaper, FaInfoCircle, FaTimes, FaInbox, FaHourglassHalf } from 'react-icons/fa';

function AvailableListings() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [claimNotification, setClaimNotification] = useState(null);

  useEffect(() => {
    const fetchAvailableListings = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('ngoToken');

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/foodlistings', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch available listings.' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setListings(data);
      } catch (err) {
        console.error("Error fetching available listings:", err);
        setError(err.message || 'Failed to fetch listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableListings();
  }, []);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = listings.filter(listing => {
      const address = listing.restaurant?.address?.toLowerCase();
      const itemName = listing.itemName?.toLowerCase();
      return (address && address.includes(lowerCaseQuery)) || (itemName && itemName.includes(lowerCaseQuery));
    });
    setFilteredListings(filtered);
  }, [searchQuery, listings]);

  const getUrgencyDetails = (expiryDateString) => {
    if (!expiryDateString) return { text: 'Unknown', styleClass: styles.urgencyNormal };
    try {
      const now = new Date();
      const expiry = new Date(expiryDateString);
      const diffMs = expiry - now;
      if (diffMs <= 0) return { text: 'Expired', styleClass: styles.urgencyExpired };
      
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours < 3) {
        return { text: `Expires in ${Math.round(diffHours * 10) / 10}h (Urgent)`, styleClass: styles.urgencyUrgent };
      } else if (diffHours < 12) {
        return { text: `Expires in ${Math.round(diffHours)}h`, styleClass: styles.urgencyAmber };
      } else {
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return { text: `Expires: ${new Date(expiryDateString).toLocaleDateString(undefined, options)}`, styleClass: styles.urgencyNormal };
      }
    } catch (e) {
      return { text: 'Valid', styleClass: styles.urgencyNormal };
    }
  };

  const handleClaim = async (listingId) => {
    const claimedListingDetails = listings.find(l => l._id === listingId);
    if (!claimedListingDetails) {
      setError("An unexpected error occurred. Could not find listing details.");
      return;
    }

    setError('');
    setClaimNotification(null);
    const token = localStorage.getItem('ngoToken');

    if (!token) {
      setError('Authentication token not found. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`/api/foodlistings/${listingId}/claim`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to claim the listing.' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setListings(prevListings => prevListings.filter(l => l._id !== listingId));
      setClaimNotification({
        itemName: claimedListingDetails.itemName,
        restaurantName: claimedListingDetails.restaurant?.name || 'the restaurant',
        expiryDate: new Date(claimedListingDetails.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' })
      });
    } catch (err) {
      console.error("Error claiming listing:", err);
      setError(err.message || 'Failed to claim listing. Please try again.');
    }
  };

  return (
    <div className={styles.availableListingsContainer}>
      <header className={styles.pageHeader}>
        <h2>Available Surplus Food</h2>
        <p className={styles.pageSubtitle}>Claim fresh surplus food listings listed by local restaurants for immediate pickup.</p>
      </header>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <span className={styles.searchIcon}><FaSearch /></span>
        <input
          type="text"
          placeholder="Search food items or location address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
          aria-label="Search available food listings"
        />
      </div>

      {/* Claim Success Notification */}
      {claimNotification && (
        <div className={styles.claimNotificationBox}>
          <span className={styles.notificationIcon}><FaInfoCircle /></span>
          <p>
            <strong>Claim successful!</strong> You claimed <strong>{claimNotification.itemName}</strong> from <strong>{claimNotification.restaurantName}</strong>. Please schedule pickup before <strong>{claimNotification.expiryDate}</strong>.
          </p>
          <button
            className={styles.closeNotificationButton}
            onClick={() => setClaimNotification(null)}
            aria-label="Close notification"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          <FaInfoCircle /> <span>{error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className={styles.skeletonGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonHeader}>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonBadge}></div>
              </div>
              <div className={styles.skeletonLine}></div>
              <div className={styles.skeletonLineShort}></div>
              <div className={styles.skeletonLine}></div>
              <div className={styles.skeletonButton}></div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (
        filteredListings.length === 0 ? (
          <div className={styles.emptyStateContainer}>
            <div className={styles.emptyIconBg}><FaInbox /></div>
            <h3>No surplus food found</h3>
            <p>
              {searchQuery
                ? `No donations found matching "${searchQuery}". Try typing another keyword.`
                : 'There are currently no active surplus listings available. Check back soon!'}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className={styles.resetButton}>
                Reset Search
              </button>
            )}
          </div>
        ) : (
          <div className={styles.listingsGrid}>
            {filteredListings.map((listing) => {
              const urgency = getUrgencyDetails(listing.expiryDate);
              return (
                <div key={listing._id} className={styles.listingCard}>
                  {/* Card Header */}
                  <div className={styles.cardHeader}>
                    <div className={styles.foodTitleGroup}>
                      <span className={styles.foodIcon}><FaUtensils /></span>
                      <h3 className={styles.foodName}>{listing.itemName}</h3>
                    </div>
                    <span className={styles.quantityBadge}>{listing.quantity} Servings</span>
                  </div>

                  {/* Urgency Alert Badge */}
                  <div className={`${styles.urgencyAlert} ${urgency.styleClass}`}>
                    <FaHourglassHalf className={styles.hourglassIcon} />
                    <span>{urgency.text}</span>
                  </div>

                  {/* Card Content (Restaurant Details) */}
                  <div className={styles.cardBody}>
                    <div className={styles.detailRow}>
                      <FaBuilding className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>Restaurant</span>
                        <span className={styles.detailValue}>{listing.restaurant?.name || 'Local Donor'}</span>
                      </div>
                    </div>

                    <div className={styles.detailRow}>
                      <FaMapMarkerAlt className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>Pickup Address</span>
                        <span className={styles.detailValue}>{listing.restaurant?.address || 'N/A'}</span>
                      </div>
                    </div>

                    <div className={styles.detailRow}>
                      <FaPhoneAlt className={styles.detailIcon} />
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>Contact Number</span>
                        <span className={styles.detailValue}>{listing.restaurant?.contactNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className={styles.cardFooter}>
                    <button
                      className={styles.claimButton}
                      onClick={() => handleClaim(listing._id)}
                    >
                      <FaHandPaper /> Claim Donation
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

export default AvailableListings; 