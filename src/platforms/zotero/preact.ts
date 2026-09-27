import { options } from "preact";

let configured = false;

export function configureZoteroPreact() {
  if (configured) return;
  configured = true;
  // Zotero's bootstrap realm may not provide queueMicrotask, which Preact uses by default.
  options.debounceRendering = (flush) => {
    void Promise.resolve().then(flush);
  };
}
