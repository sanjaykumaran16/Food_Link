import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../restraunt_reg/RestaurantRegistration.module.css';
import { register } from '../services/authService';

function VolunteerRegistration() {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', contactNumber: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register({ ...form, role: 'volunteer', phone: form.contactNumber });
      setSuccess('Registered! Pending approval if required.');
      setTimeout(() => navigate('/volunteer/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registrationContainer}>
      <h2>Volunteer Registration</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {success && <p className={styles.successMessage}>{success}</p>}
      <form onSubmit={handleSubmit} className={styles.registrationForm}>
        {['name', 'email', 'password', 'address', 'contactNumber'].map((field) => (
          <div key={field} className={styles.formGroup}>
            <label htmlFor={field}>{field}</label>
            <input id={field} name={field} type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'} value={form[field]} onChange={handleChange} required />
          </div>
        ))}
        <button type="submit" className={styles.submitButton} disabled={loading}>{loading ? 'Submitting...' : 'Register'}</button>
      </form>
    </div>
  );
}

export default VolunteerRegistration;
