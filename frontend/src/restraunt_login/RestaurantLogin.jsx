import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RestaurantLogin.module.css';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { login } from '../services/authService';

function RestaurantLogin({ showForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    // const apiUrl = `${import.meta.env.VITE_API_URL}/api/restaurants/login`; // No longer needed with proxy
    // console.log('Attempting login to:', apiUrl); // No longer needed

    try {
      const data = await login({ email, password, role: 'restaurant' });
      if (data.token || data.accessToken) {
        navigate('/restaurant/dashboard');
      } else {
        setError('Login failed: Could not authenticate session.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2>Restaurant Login</h2>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        <div className={styles.formGroup}>
          <label htmlFor="email">Email ID</label>
          <div className={styles.inputGroup}> {/* Wrapper for icon + input */} 
            <FaEnvelope className={styles.inputIcon} />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" // Add placeholder
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <div className={styles.inputGroup}> {/* Wrapper for icon + input */} 
            <FaLock className={styles.inputIcon} />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" // Add placeholder
              required
              minLength="6"
            />
          </div>
        </div>

        {showForgotPassword && (
          <div className={styles.forgotPasswordRow}>
            <a href="#" className={styles.forgotPasswordLink}>Forgot Password?</a>
          </div>
        )}

        <button type="submit" className={styles.submitButton}>Login</button>
      </form>
      {/* Optional: Link to registration */}
      {/* <p className={styles.switchFormText}>Don't have an account? <Link to="/restaurant/register">Register here</Link></p> */}
    </div>
  );
}

export default RestaurantLogin;
