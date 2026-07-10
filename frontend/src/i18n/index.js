import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ta from './locales/ta.json';

// Tamil requires the Noto Sans Tamil font for proper glyph rendering
// and lang="ta" on <html> for browser IME / input method support
const applyLangToDocument = (lng) => {
  document.documentElement.lang = lng;

  // Remove any previously added language font link
  const existing = document.getElementById('fl-lang-font');
  if (existing) existing.remove();

  if (lng === 'ta') {
    // Load Noto Sans Tamil from Google Fonts for perfect Tamil glyph support
    const link = document.createElement('link');
    link.id = 'fl-lang-font';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700&display=swap';
    document.head.appendChild(link);

    // Apply Tamil font to the root element
    document.documentElement.style.setProperty('--font-tamil', '"Noto Sans Tamil", sans-serif');
    document.body.classList.add('lang-ta');
  } else {
    document.documentElement.style.removeProperty('--font-tamil');
    document.body.classList.remove('lang-ta');
  }
};

const savedLang = localStorage.getItem('language') || 'en';
// Guard: if user had 'hi' saved from before, fall back to 'en'
const initialLng = ['en', 'ta'].includes(savedLang) ? savedLang : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ta: { translation: ta },
  },
  lng: initialLng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Apply on first load
applyLangToDocument(initialLng);

// Apply whenever language changes
i18n.on('languageChanged', (lng) => {
  applyLangToDocument(lng);
});

export default i18n;
