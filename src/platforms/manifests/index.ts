import { chromeManifest } from "./chrome.ts";
import { firefoxManifest } from "./firefox.ts";
import { zoteroManifest } from "./zotero.ts";

export { createZoteroUpdate } from "./zotero.ts";

export type Target = "chrome" | "firefox" | "zotero";

export const MANIFESTS = {
  chrome: chromeManifest,
  firefox: firefoxManifest,
  zotero: zoteroManifest,
} satisfies Record<Target, unknown>;
