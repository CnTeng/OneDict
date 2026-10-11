import i18next from "i18next";
import en from "./locales/en.json";
import zh from "./locales/zh.json";

export const i18n = i18next.createInstance();
void i18n.init({
  lng: "en",
  supportedLngs: ["en", "zh"],
  load: "languageOnly",
  fallbackLng: "en",
  resources: { en: { translation: en }, zh: { translation: zh } },
  nsSeparator: false,
  initAsync: false,
  interpolation: { escapeValue: false },
});

export const t = i18n.t.bind(i18n);
