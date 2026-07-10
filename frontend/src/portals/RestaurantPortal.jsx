import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './RestaurantPortal.module.css';
import RestaurantLogin from '../restraunt_login/RestaurantLogin';
import RestaurantRegistration from '../restraunt_reg/RestaurantRegistration';

function RestaurantPortal() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className={styles.portalContainer}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.welcomeHeading}>{t('portal.welcomeBack')}</h1>
        <div className={styles.pillToggleGroup}>
          <button
            className={activeTab === 'login' ? `${styles.pillToggle} ${styles.activePill}` : styles.pillToggle}
            onClick={() => setActiveTab('login')}
          >
            {t('portal.restaurant')}
          </button>
          <button
            className={activeTab === 'signup' ? `${styles.pillToggle} ${styles.activePill}` : styles.pillToggle}
            onClick={() => setActiveTab('signup')}
          >
            {t('portal.signUp')}
          </button>
        </div>
        <div className={styles.formCard}>
          {activeTab === 'login' ? <RestaurantLogin showForgotPassword /> : <RestaurantRegistration />}
        </div>
      </div>
    </div>
  );
}

export default RestaurantPortal;