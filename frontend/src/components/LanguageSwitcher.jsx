import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = [
  { code: 'en', label: 'EN', title: 'English' },
  { code: 'ta', label: 'த', title: 'தமிழ்' },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const change = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className={styles.switcher} role="group" aria-label="Language selector">
      {LANGUAGES.map(({ code, label, title }) => (
        <button
          key={code}
          type="button"
          title={title}
          aria-label={`Switch to ${title}`}
          aria-pressed={i18n.language === code}
          className={i18n.language === code ? styles.active : ''}
          onClick={() => change(code)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
