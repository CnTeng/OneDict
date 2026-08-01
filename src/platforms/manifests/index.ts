import { chromeManifest } from "./chrome.ts";
import { firefoxManifest } from "./firefox.ts";
import { zoteroManifest } from "./zotero.ts";

export { chromeManifest } from "./chrome.ts";
export { firefoxManifest } from "./firefox.ts";
export { zoteroManifest } from "./zotero.ts";

export type Target = "chrome" | "firefox" | "zotero";

export const MANIFESTS = {
  chrome: chromeManifest,
  firefox: firefoxManifest,
  zotero: zoteroManifest,
} satisfies Record<Target, unknown>;
