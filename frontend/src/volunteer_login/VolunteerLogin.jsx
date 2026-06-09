import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../restraunt_login/RestaurantLogin.module.css';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { login } from '../services/authService';

function VolunteerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password, role: 'volunteer' });
      navigate('/volunteer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2>Volunteer Login</h2>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <div className={styles.inputGroup}>
            <FaEnvelope className={styles.inputIcon} />
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <div className={styles.inputGroup}>
            <FaLock className={styles.inputIcon} />
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
        </div>
        <button type="submit" className={styles.submitButton} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
    </div>
  );
}

export default VolunteerLogin;
