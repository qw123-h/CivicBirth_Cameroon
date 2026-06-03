import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import frTranslations from './i18n/fr.json';
import enTranslations from './i18n/en.json';

// Initialize i18n
i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: frTranslations },
    en: { translation: enTranslations },
  },
  lng: localStorage.getItem('language') || 'fr',
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false,
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
