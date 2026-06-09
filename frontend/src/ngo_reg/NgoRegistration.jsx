import React, { useState } from 'react';
import styles from './NgoRegistration.module.css';
import { FaBuilding, FaEnvelope, FaLock, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import { registerLegacy } from '../services/authService';
// import { useNavigate } from 'react-router-dom';

function NgoRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    contactNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { name, contact_person, email, phone, address, password, contactNumber } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Use required fields from the *backend* schema
    if (!name || !email || !password || !address || !contactNumber) {
      setError('Please fill in all required fields: Name, Email, Password, Address, Contact Number.');
      return;
    }
    // Password length check can be done on backend too, but frontend check is fine
    if (password.length < 6) { // Assuming backend requires min 6
      setError('Password must be at least 6 characters long.');
      return;
    }
    try {
      await registerLegacy('ngo', { name, email, password, address, contactNumber });
      setSuccess('Registration successful! You can now log in.');
      setFormData({
        name: '', contact_person: '', email: '', phone: '', address: '', password: '', contactNumber: ''
      });

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className={styles.registrationContainer}>
      <h2>NGO Registration</h2>
      <form onSubmit={handleSubmit} className={styles.registrationForm}>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}

        <div className={styles.formGroup}>
          <label htmlFor="name">NGO Name <span className={styles.required}>*</span></label>
          <div className={styles.inputGroup}>
            <FaBuilding className={styles.inputIcon} />
            <input type="text" id="name" value={name} onChange={handleChange} placeholder="e.g., Community Helpers" required />
          </div>
        </div>

        {/* Remove contact_person and phone if not in backend schema */}
        {/* <div className={styles.formGroup}>
          <label htmlFor="contact_person">Contact Person</label>
          <input type="text" id="contact_person" value={contact_person} onChange={handleChange} />
        </div> */}

        <div className={styles.formGroup}>
          <label htmlFor="email">Email <span className={styles.required}>*</span></label>
          <div className={styles.inputGroup}>
            <FaEnvelope className={styles.inputIcon} />
            <input type="email" id="email" value={email} onChange={handleChange} placeholder="ngo@email.com" required />
          </div>
        </div>

        {/* Remove phone if not in backend schema */}
        {/* <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input type="tel" id="phone" value={phone} onChange={handleChange} />
        </div> */}

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
            <textarea id="address" value={address} onChange={handleChange} placeholder="456 Community Ave, City" required />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="contactNumber">Contact Number <span className={styles.required}>*</span></label>
          <div className={styles.inputGroup}>
            <FaPhoneAlt className={styles.inputIcon} />
            <input type="tel" id="contactNumber" value={contactNumber} onChange={handleChange} placeholder="(555) 987-6543" required />
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>Register</button>
      </form>
    </div>
  );
}

export default NgoRegistration;
