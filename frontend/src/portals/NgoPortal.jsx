import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './NgoPortal.module.css';
import NgoLogin from '../ngo_login/NgoLogin';
import NgoRegistration from '../ngo_reg/NgoRegistration';

function NgoPortal() {
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
            {t('portal.ngo')}
          </button>
          <button
            className={activeTab === 'signup' ? `${styles.pillToggle} ${styles.activePill}` : styles.pillToggle}
            onClick={() => setActiveTab('signup')}
          >
            {t('portal.signUp')}
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