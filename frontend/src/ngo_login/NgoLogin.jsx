import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NgoLogin.module.css';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { login } from '../services/authService';

function NgoLogin() {
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
    try {
      const data = await login({ email, password, role: 'ngo' });
      if (data.token || data.accessToken) {
        navigate('/ngo/dashboard');
      } else {
        setError('Login failed: Could not authenticate session.');
      }
    } catch (err) {
      console.error('NGO Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2>NGO Login</h2>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <div className={styles.inputGroup}>
            <FaEnvelope className={styles.inputIcon} />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your NGO email"
              required 
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <div className={styles.inputGroup}>
            <FaLock className={styles.inputIcon} />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required 
              minLength="6" 
            />
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>Login</button>
      </form>
      {/* Optional: Link to registration */}
      {/* <p className={styles.switchFormText}>Don't have an account? <Link to="/ngo/register">Register here</Link></p> */}
    </div>
  );
}

export default NgoLogin; 