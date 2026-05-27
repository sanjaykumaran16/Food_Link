import React, { useState } from 'react';
import styles from './RestaurantRegistration.module.css';
import { FaUtensils, FaEnvelope, FaLock, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

function RestaurantRegistration() {
  // const navigate = useNavigate(); // Uncomment if using react-router navigation
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    contactNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const { name, email, password, address, contactNumber } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true); // Set loading true

    // Basic Frontend Validation
    if (!name || !email || !password || !address || !contactNumber) {
      setError('Please fill in all required fields.');
      return;
    }
    // Add more specific validation if needed (e.g., email format, password complexity)
    if (password.length < 6) { // Example length check
        setError('Password must be at least 6 characters long.');
        return;
    }

    try {
      const response = await fetch('/api/restaurants/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Send all form data
      });

      // Safely parse JSON — guards against empty or non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || 'Unexpected server response' };
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Handle successful registration
      setSuccess('Restaurant registered successfully! You can now log in.');
      setFormData({ name: '', email: '', password: '', address: '', contactNumber: '' });
      
      // Optional: Store token/user info if returned by backend
      // if(data.token) {
      //    localStorage.setItem('restaurantToken', data.token); 
      //    localStorage.setItem('userInfo', JSON.stringify(data.restaurant)); // Store restaurant info 
      // }
      
      // Optional: Redirect to login page or dashboard after a delay
      // setTimeout(() => navigate('/restaurant/login'), 2000); 

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false); // Set loading false regardless of success/error
    }
  };

  return (
    <div className={styles.registrationContainer}>
      <h2>Restaurant Registration</h2>
      <form onSubmit={handleSubmit} className={styles.registrationForm}>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}

        <div className={styles.formGroup}>
          <label htmlFor="name">Restaurant Name <span className={styles.required}>*</span></label>
          <div className={styles.inputGroup}>
            <FaUtensils className={styles.inputIcon} />
            <input type="text" id="name" value={name} onChange={handleChange} placeholder="e.g., The Grand Cafe" required />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email <span className={styles.required}>*</span></label>
          <div className={styles.inputGroup}>
            <FaEnvelope className={styles.inputIcon} />
            <input type="email" id="email" value={email} onChange={handleChange} placeholder="your@email.com" required />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password <span className={styles.required}>*</span></label>
          <div className={styles.inputGroup}>
            <FaLock className={styles.inputIcon} />
            <input type="password" id="password" value={password} onChange={handleChange} placeholder="Min. 6 characters" required minLength="6" />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="address">Address <span className={styles.required}>*</span></label>
          <div className={styles.inputGroup}>
            <FaMapMarkerAlt className={styles.inputIcon} style={{ marginTop: '0.8rem' }} />
            <textarea id="address" value={address} onChange={handleChange} placeholder="123 Main Street, City" required />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="contactNumber">Contact Number <span className={styles.required}>*</span></label>
          <div className={styles.inputGroup}>
            <FaPhoneAlt className={styles.inputIcon} />
            <input type="tel" id="contactNumber" value={contactNumber} onChange={handleChange} placeholder="(555) 123-4567" required />
          </div>
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export default RestaurantRegistration;
