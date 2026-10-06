import { browserManifest } from "./base.ts";

export const chromeManifest = {
  ...browserManifest,
  permissions: ["storage"],
  options_page: "platforms/browser/options/options.html",
  minimum_chrome_version: "114.0.0.0",
};
