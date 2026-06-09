import React, { useState } from 'react';
import styles from '../restaurant_dashboard/AddFoodListing.module.css';
import { createListingWithPhotos, createListing } from '../services/listingService';

/**
 * Extended listing form with photos + safety checklist (new component — existing AddFoodListing unchanged).
 */
function ListingPhotoUpload() {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [photos, setPhotos] = useState([]);
  const [safety, setSafety] = useState({
    properlyStored: false,
    withinSafeTemp: false,
    labeledCorrectly: false,
    noCrossContamination: false,
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);
    if (!itemName || !quantity || !expiryDate) {
      setFormError('Please fill required fields.');
      setIsSubmitting(false);
      return;
    }
    if (!Object.values(safety).every(Boolean)) {
      setFormError('Complete the food safety checklist.');
      setIsSubmitting(false);
      return;
    }
    try {
      if (photos.length === 0) {
        await createListing({ itemName, quantity, expiryDate });
        setFormSuccess('Listing created (no photos). Add Cloudinary keys to enable photo uploads.');
      } else {
        const fd = new FormData();
        fd.append('itemName', itemName);
        fd.append('quantity', quantity);
        fd.append('expiryDate', expiryDate);
        fd.append('safetyChecklist', JSON.stringify(safety));
        photos.forEach((f) => fd.append('photos', f));
        await createListingWithPhotos(fd);
        setFormSuccess('Listing with photos created!');
      }
      setItemName('');
      setQuantity('');
      setExpiryDate('');
      setPhotos([]);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Add Listing (with photos)</h2>
      {formError && <p className={styles.errorMessage}>{formError}</p>}
      {formSuccess && <p className={styles.successMessage}>{formSuccess}</p>}
      <form onSubmit={handleSubmit} className={styles.listingForm}>
        <div className={styles.formGroup}>
          <label htmlFor="itemName">Food Item</label>
          <input id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="quantity">Quantity</label>
          <input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="expiryDate">Expiry</label>
          <input id="expiryDate" type="datetime-local" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label>Photos</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setPhotos(Array.from(e.target.files))} />
        </div>
        <fieldset>
          <legend>Food safety checklist</legend>
          {Object.keys(safety).map((key) => (
            <label key={key} style={{ display: 'block' }}>
              <input type="checkbox" checked={safety[key]} onChange={(e) => setSafety({ ...safety, [key]: e.target.checked })} />
              {key.replace(/([A-Z])/g, ' $1')}
            </label>
          ))}
        </fieldset>
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Post listing'}
        </button>
      </form>
    </div>
  );
}

export default ListingPhotoUpload;
