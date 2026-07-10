import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './RestaurantLogin.module.css';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { login, forgotPassword } from '../services/authService';

function RestaurantLogin({ showForgotPassword }) {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isSendingForgot, setIsSendingForgot] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError(t('auth.fillBoth'));
      return;
    }
    try {
      const data = await login({ email, password, role: 'restaurant' });
      if (data.token || data.accessToken) {
        navigate('/restaurant/dashboard');
      } else {
        setError(t('auth.loginFailed'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || t('auth.loginFailed'));
    }
  };

  // When Tamil is active, enable the Tamil keyboard layout on text inputs
  const isTamil = i18n.language === 'ta';

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setIsSendingForgot(true);
    try {
      await forgotPassword(forgotEmail, 'restaurant');
      setForgotSuccess('A password reset link has been sent to your email.');
      setForgotEmail('');
    } catch (err) {
      setForgotError(err.response?.data?.message || err.message || 'Failed to send reset link.');
    } finally {
      setIsSendingForgot(false);
    }
  };

  if (isForgotMode) {
    return (
      <div className={styles.loginContainer}>
        <h2>{t('auth.forgotPassword')}</h2>
        <form onSubmit={handleForgotSubmit} className={styles.loginForm}>
          {forgotError && <p className={styles.errorMessage}>{forgotError}</p>}
          {forgotSuccess && <p className={styles.successMessage} style={{ color: 'var(--success-text)', backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-border)', padding: '0.85rem 1.2rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>{forgotSuccess}</p>}

          <div className={styles.formGroup}>
            <label htmlFor="restaurant-forgot-email">{t('auth.emailLabel')}</label>
            <div className={styles.inputGroup}>
              <FaEnvelope className={styles.inputIcon} />
              <input
                type="email"
                id="restaurant-forgot-email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                required
                lang="en"
              />
            </div>
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSendingForgot}>
            {isSendingForgot ? 'Sending...' : 'Send Reset Link'}
          </button>
          
          <div className={styles.forgotPasswordRow} style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); setIsForgotMode(false); }} className={styles.forgotPasswordLink}>
              Back to Login
            </a>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <h2>{t('auth.restaurantLogin')}</h2>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        {error && <p className={styles.errorMessage}>{error}</p>}

        <div className={styles.formGroup}>
          <label htmlFor="restaurant-email">{t('auth.emailLabel')}</label>
          <div className={styles.inputGroup}>
            <FaEnvelope className={styles.inputIcon} />
            <input
              type="email"
              id="restaurant-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              required
              lang="en"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="restaurant-password">{t('auth.passwordLabel')}</label>
          <div className={styles.inputGroup}>
            <FaLock className={styles.inputIcon} />
            <input
              type="password"
              id="restaurant-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              required
              minLength="6"
              lang="en"
            />
          </div>
        </div>

        {showForgotPassword && (
          <div className={styles.forgotPasswordRow}>
            <a href="#" onClick={(e) => { e.preventDefault(); setIsForgotMode(true); }} className={styles.forgotPasswordLink}>{t('auth.forgotPassword')}</a>
          </div>
        )}

        <button type="submit" className={styles.submitButton}>{t('auth.loginBtn')}</button>
      </form>
    </div>
  );
}

export default RestaurantLogin;
