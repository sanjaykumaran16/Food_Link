import React, { useState } from 'react';
import styles from '../restaurant_dashboard/AddFoodListing.module.css';
import { createListingWithPhotos } from '../services/listingService';
import FoodSafetyChecklist from '../components/FoodSafetyChecklist';

const emptySafety = {
  properlyStored: false,
  withinSafeTemp: false,
  labeledCorrectly: false,
  noCrossContamination: false,
};

function ListingPhotoUpload() {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('cooked');
  const [storageTemp, setStorageTemp] = useState('hot');
  const [preparedAt, setPreparedAt] = useState('');
  const [photos, setPhotos] = useState([]);
  const [safety, setSafety] = useState(emptySafety);
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

    const needsPreparedAt = category === 'cooked' || category === 'dairy' || category === 'bakery';
    if (needsPreparedAt && !preparedAt) {
      setFormError('Prepared/cooked time is required for this food category.');
      setIsSubmitting(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append('itemName', itemName);
      fd.append('quantity', quantity);
      fd.append('expiryDate', expiryDate);
      fd.append('category', category);
      fd.append('storageTemp', storageTemp);
      if (preparedAt) fd.append('preparedAt', preparedAt);
      fd.append('safetyChecklist', JSON.stringify(safety));
      photos.forEach((f) => fd.append('photos', f));
      await createListingWithPhotos(fd);
      setFormSuccess('Listing with photos created and safety verified!');
      setItemName('');
      setQuantity('');
      setExpiryDate('');
      setCategory('cooked');
      setStorageTemp('hot');
      setPreparedAt('');
      setPhotos([]);
      setSafety(emptySafety);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Add Listing (with photos)</h2>
      <p className={styles.safetyNote}>
        Photos and safety compliance are required before NGOs can see your listing.
      </p>
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
          <label htmlFor="expiryDate">Pickup deadline</label>
          <input id="expiryDate" type="datetime-local" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label>Photos</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setPhotos(Array.from(e.target.files))} />
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
          {isSubmitting ? 'Submitting...' : 'Post listing'}
        </button>
      </form>
    </div>
  );
}

export default ListingPhotoUpload;
