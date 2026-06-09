import React, { useState } from 'react';
import styles from './AddFoodListing.module.css';
import { createListing } from '../services/listingService';

function AddFoodListing() {
  // State specifically for the form
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    if (!itemName || !quantity || !expiryDate) {
      setFormError('Please fill out all fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      await createListing({ itemName, quantity, expiryDate });
      setFormSuccess('Food listing added successfully!');
      // Clear the form
      setItemName('');
      setQuantity('');
      setExpiryDate('');
      // Note: Cannot update count here as it's managed by the parent dashboard

    } catch (err) {
      console.error('Error submitting food listing:', err);
      setFormError(err.response?.data?.message || err.message || 'Failed to add food listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Use the new formContainer class, remove inline styles
    <div className={styles.formContainer}> 
      {/* Remove the inner formSection div, not needed */}
      {/* <div className={styles.formSection} style={{ width: '100%', padding: '0', background: 'none' }}> */}
        <h2>Add New Food Listing</h2>
        {formError && <p className={styles.errorMessage}>{formError}</p>}
        {formSuccess && <p className={styles.successMessage}>{formSuccess}</p>}
        <form onSubmit={handleFormSubmit} className={styles.listingForm}>
          {/* Form inputs remain the same */}
          <div className={styles.formGroup}>
            <label htmlFor="itemName">Food Item:</label>
            <input
              type="text"
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="text"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 5 kg"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="expiryDate">Expiry Date:</label>
            <input
              type="date"
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Listing'}
          </button>
        </form>
      {/* </div> */}
    </div>
  );
}

export default AddFoodListing; 