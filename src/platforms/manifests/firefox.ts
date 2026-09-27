import { browserManifest } from "./base.ts";

export const firefoxManifest = {
  ...browserManifest,
  permissions: ["storage"],
  options_ui: {
    page: "platforms/browser/options/options.html",
    open_in_tab: true,
  },
  browser_specific_settings: {
    gecko: {
      id: "onedict@example.com",
      strict_min_version: "109.0",
    },
  },
};
