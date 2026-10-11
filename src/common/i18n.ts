import i18next from "i18next";

const resources = Object.fromEntries(
  Object.entries(
    import.meta.glob<Record<string, unknown>>("./locales/*.json", {
      eager: true,
      import: "default",
    }),
  ).map(([path, translation]) => [
    path.replace("./locales/", "").replace(/\.json$/, ""),
    { translation },
  ]),
);

export const i18n = i18next.createInstance();
void i18n.init({
  lng: "en",
  supportedLngs: Object.keys(resources),
  fallbackLng: "en",
  resources,
  initAsync: false,
  interpolation: { escapeValue: false },
});

export const t = i18n.t.bind(i18n);
