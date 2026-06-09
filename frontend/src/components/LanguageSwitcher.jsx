import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const change = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className={styles.switcher}>
      <button type="button" className={i18n.language === 'en' ? styles.active : ''} onClick={() => change('en')}>EN</button>
      <button type="button" className={i18n.language === 'hi' ? styles.active : ''} onClick={() => change('hi')}>हि</button>
      <button type="button" className={i18n.language === 'ta' ? styles.active : ''} onClick={() => change('ta')}>த</button>
    </div>
  );
}

export default LanguageSwitcher;
