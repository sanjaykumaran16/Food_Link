import React, { useState } from 'react';
import styles from './AddFoodListing.module.css';

function AddFoodListing() {
  const [formData, setFormData] = useState({
    food_name: '',
    quantity: '',
    expiry_time: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { food_name, quantity, expiry_time } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Use fields from the backend Food schema
    if (!food_name || !quantity || !expiry_time) {
      setError('Please fill in all fields: Food Name, Quantity, Expiry Time.');
      return;
    }

    const expiryDate = new Date(expiry_time);
    if (expiryDate <= new Date()) {
        setError('Expiry time must be in the future.');
        return;
    }

    const token = localStorage.getItem('restaurantToken');
    if (!token) {
        setError('You must be logged in as a restaurant to add food.');
        return;
    }

    const apiUrl = '/api/food/add';
      console.log('Attempting to add food listing');

    const listingData = {
        food_name,
        quantity,
        expiry_time
    };

    try {
      const response = await fetch(apiUrl, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Send token for authentication
        },
        body: JSON.stringify(listingData), // Send data matching schema
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Handle successful submission
      console.log('Food listing added:', data);
      setSuccess('Food listing added successfully!');
      setFormData({ food_name: '', quantity: '', expiry_time: '' });

    } catch (err) {
      console.error('Add food listing error:', err);
      setError(err.message || 'Failed to add food listing. Please try again.');
    }
  };

  return (
    <div className={styles.addListingContainer}>
      <h2>Add New Food Listing</h2>
      <form onSubmit={handleSubmit} className={styles.addListingForm}>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}

        <div className={styles.formGroup}>
          <label htmlFor="food_name">Food Name <span className={styles.required}>*</span></label>
          <input type="text" id="food_name" value={food_name} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="quantity">Quantity <span className={styles.required}>*</span> (e.g., '5 kg', '10 meals')</label>
          <input type="text" id="quantity" value={quantity} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="expiry_time">Expiry Date & Time <span className={styles.required}>*</span></label>
          <input type="datetime-local" id="expiry_time" value={expiry_time} onChange={handleChange} required />
        </div>

        <button type="submit" className={styles.submitButton}>Add Listing</button>
      </form>
    </div>
  );
}

export default AddFoodListing;
