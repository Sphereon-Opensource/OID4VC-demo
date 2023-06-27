import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
.use(Backend)
.use(LanguageDetector)
.use(initReactI18next)
.init({
  backend: {
    loadPath: `locales/${'development'}/{{lng}}/{{ns}}.json`
  },
  fallbackLng: 'en',
  debug: true,
  interpolation: {
    escapeValue: false,
  }
})
.catch(error => {
  console.error('Error initializing i18n:', error);
});

export default i18n;
