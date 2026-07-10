import React, { useState, useEffect } from 'react';
import styles from './MyRestaurantListings.module.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import EditListingModal from './EditListingModal';
import { getMyListings, deleteListing } from '../services/listingService';
import MessageUserButton from '../components/MessageUserButton';

function MyRestaurantListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingListing, setEditingListing] = useState(null); // State to hold the listing being edited

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMyListings();
        const listingsWithDate = data.map(listing => ({
            ...listing,
            listedAtDate: new Date(listing.listedAt || listing.createdAt)
        }));
        setListings(listingsWithDate);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError(err.message || 'Failed to fetch listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []); // Empty dependency array means this runs once on mount

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      return dateObj.toLocaleDateString();
    } catch (e) {
      console.error("Error formatting date:", e, "Input:", date);
      return 'Invalid Date';
    }
  };

  // Opens the edit modal
  const handleEdit = (listingId) => {
    const listingToEdit = listings.find(l => l._id === listingId);
    if (listingToEdit) {
      console.log("Opening edit modal for:", listingToEdit);
      setEditingListing(listingToEdit);
    } else {
        console.error("Could not find listing to edit with ID:", listingId);
        setError("Could not find the listing to edit. Please refresh the page.");
    }
  };

  // Closes the edit modal
  const handleCloseEditModal = () => {
    setEditingListing(null);
  };

  // Handles the update after successful edit in the modal
  const handleUpdateListing = (updatedListingData) => {
    // Update the listing in the state
    setListings(currentListings =>
      currentListings.map(l =>
        l._id === updatedListingData._id ? { ...l, ...updatedListingData, listedAtDate: new Date(updatedListingData.listedAt || l.listedAt) } : l
        // Note: We reconstruct listedAtDate using the potentially updated listedAt from response OR original
        // This might not be strictly necessary if listedAt isn't updated, but safer.
      )
    );
    // Optionally refetch listings: fetchListings();
  };

  const handleDelete = async (listingId) => {
    // Confirmation dialog
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return; // Stop if user cancels
    }

    setError(''); // Clear previous errors

    try {
      await deleteListing(listingId);
      setListings(currentListings => currentListings.filter(l => l._id !== listingId));
    } catch (err) {
       console.error("Error deleting listing:", err);
       setError(err.response?.data?.message || err.message || "Failed to delete listing. Please try again.");
    }
  };

  const isEditable = (listedAtDate) => {
    if (!(listedAtDate instanceof Date) || isNaN(listedAtDate.getTime())) {
        console.warn("Invalid date passed to isEditable:", listedAtDate);
        return false;
    }
    const twoHoursInMillis = 2 * 60 * 60 * 1000;
    const currentTime = Date.now();
    const listingTime = listedAtDate.getTime();
    return (currentTime - listingTime) < twoHoursInMillis;
  };

  return (
    <div className={styles.myListingsContainer}>
      <h2>My Food Listings</h2>

      {loading && <p>Loading listings...</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* Conditionally render the Edit Modal */}
      {editingListing && (
        <EditListingModal 
          listing={editingListing} 
          onClose={handleCloseEditModal} 
          onUpdate={handleUpdateListing} 
        />
      )}

      {!loading && !error && (
        listings.length === 0 ? (
          <p>You haven't listed any food items yet.</p>
        ) : (
          <table className={styles.listingsTable}>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Safety</th>
                <th>Listed At</th>
                <th>Collected By NGO</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => {
                const canEdit = isEditable(listing.listedAtDate);
                const isActuallyExpired = listing.status === 'Available' && new Date(listing.expiryDate) < new Date();
                const displayStatus = isActuallyExpired ? 'Expired' : listing.status;
                const statusClass = isActuallyExpired ? styles.statusExpired : styles[`status${listing.status}`];

                return (
                  <tr key={listing._id}>
                    <td>{listing.itemName}</td>
                    <td>{listing.quantity}</td>
                    <td>{formatDate(listing.expiryDate)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass}`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td>
                      <span className={styles.safetyBadge}>
                        {listing.safetyStatus || 'pending'}
                      </span>
                    </td>
                    <td>{formatDate(listing.listedAtDate)}</td>
                    <td>
                      {listing.collectedByNgo
                        ? `${listing.collectedByNgo.name} (${listing.collectedByNgo.contactNumber || 'N/A'})`
                        : 'Not Collected Yet'}
                    </td>
                    <td className={styles.actionsCell}>
                      {listing.collectedByNgo?._id && (
                        <MessageUserButton
                          userId={listing.collectedByNgo._id}
                          userName={listing.collectedByNgo.name}
                          listingId={listing._id}
                          className={styles.messageBtn}
                        />
                      )}
                      <button
                        className={`${styles.actionButton} ${styles.editButton} ${!canEdit ? styles.disabledButton : ''}`}
                        onClick={() => canEdit && handleEdit(listing._id)}
                        disabled={!canEdit}
                        title={canEdit ? "Edit this listing" : "Editing only allowed within 2 hours of listing"}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => handleDelete(listing._id)}
                        title="Delete this listing"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}

export default MyRestaurantListings;
