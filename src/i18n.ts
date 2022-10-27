import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import km_en from './Resources/locales/en/key_message.json';
import km_zh from './Resources/locales/zh/key_message.json';

i18n
.use(Backend)
.use(LanguageDetector)
.use(initReactI18next)
.init({
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
});

i18n.addResourceBundle('en', 'key_message', km_en);
i18n.addResourceBundle('zh', 'key_message', km_zh);

export default i18n;