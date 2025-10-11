// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// load translations (same as you have)
const resources = {
  en: { translation: require("../locales/en/translation.json") },
  hi: { translation: require("../locales/hi/translation.json") },
  fr: { translation: require("../locales/fr/translation.json") },
  es: { translation: require("../locales/es/translation.json") },
  pt: { translation: require("../locales/pt/translation.json") },
  zh: { translation: require("../locales/zh/translation.json") },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    // default language for initial server/client render
    lng: "en",
    fallbackLng: "en",
    debug: false,

    // keep React integration stable
    react: {
      useSuspense: false,
    },

    interpolation: {
      escapeValue: false,
    },

    // ensure synchronous init (safer for SSR/hydration)
    initImmediate: false,
  });

export default i18n;
