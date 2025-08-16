import React, { useState } from 'react';
import styles from './NgoPortal.module.css';
import NgoLogin from '../ngo_login/NgoLogin';
import NgoRegistration from '../ngo_reg/NgoRegistration';

function NgoPortal() {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className={styles.portalContainer}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.welcomeHeading}>Welcome back</h1>
        <div className={styles.pillToggleGroup}>
          <button
            className={activeTab === 'login' ? `${styles.pillToggle} ${styles.activePill}` : styles.pillToggle}
            onClick={() => setActiveTab('login')}
          >
            NGO
          </button>
          <button
            className={activeTab === 'signup' ? `${styles.pillToggle} ${styles.activePill}` : styles.pillToggle}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>
        <div className={styles.formCard}>
          {activeTab === 'login' ? <NgoLogin showForgotPassword /> : <NgoRegistration />}
        </div>
      </div>
    </div>
  );
}

export default NgoPortal;