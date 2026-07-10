import React, { useState } from 'react';
import styles from './AddFoodListing.module.css';
import { createListing } from '../services/listingService';
import FoodSafetyChecklist from '../components/FoodSafetyChecklist';

const emptySafety = {
  properlyStored: false,
  withinSafeTemp: false,
  labeledCorrectly: false,
  noCrossContamination: false,
};

function AddFoodListing() {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('cooked');
  const [storageTemp, setStorageTemp] = useState('hot');
  const [preparedAt, setPreparedAt] = useState('');
  const [safety, setSafety] = useState(emptySafety);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    if (!itemName || !quantity || !expiryDate) {
      setFormError('Please fill out all required fields.');
      setIsSubmitting(false);
      return;
    }

    if (!Object.values(safety).every(Boolean)) {
      setFormError('Complete all food safety checklist items.');
      setIsSubmitting(false);
      return;
    }

    const needsPreparedAt = category === 'cooked' || category === 'dairy' || category === 'bakery';
    if (needsPreparedAt && !preparedAt) {
      setFormError('Prepared/cooked time is required for this food category.');
      setIsSubmitting(false);
      return;
    }

    try {
      await createListing({
        itemName,
        quantity,
        expiryDate,
        category,
        storageTemp,
        preparedAt: preparedAt || undefined,
        safetyChecklist: safety,
      });
      setFormSuccess('Food listing added successfully! It passed safety verification.');
      setItemName('');
      setQuantity('');
      setExpiryDate('');
      setCategory('cooked');
      setStorageTemp('hot');
      setPreparedAt('');
      setSafety(emptySafety);
    } catch (err) {
      console.error('Error submitting food listing:', err);
      setFormError(err.response?.data?.message || err.message || 'Failed to add food listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Add New Food Listing</h2>
      <p className={styles.safetyNote}>
        All listings require cold-chain / food safety compliance before they appear to NGOs.
      </p>
      {formError && <p className={styles.errorMessage}>{formError}</p>}
      {formSuccess && <p className={styles.successMessage}>{formSuccess}</p>}
      <form onSubmit={handleFormSubmit} className={styles.listingForm}>
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
            placeholder="e.g., 50 portions"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="expiryDate">Pickup deadline:</label>
          <input
            type="datetime-local"
            id="expiryDate"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <FoodSafetyChecklist
          category={category}
          storageTemp={storageTemp}
          preparedAt={preparedAt}
          safety={safety}
          onCategoryChange={setCategory}
          onStorageTempChange={setStorageTemp}
          onPreparedAtChange={setPreparedAt}
          onSafetyChange={setSafety}
        />

        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Verifying safety...' : 'Add Listing'}
        </button>
      </form>
    </div>
  );
}

export default AddFoodListing;
