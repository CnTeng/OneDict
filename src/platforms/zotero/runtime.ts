import { options } from "preact";

// Import native Gecko APIs before dependencies detect sandbox capabilities.
Cu.importGlobalProperties(["AbortController", "FormData", "ReadableStream"]);

// Zotero's bootstrap realm may not provide Preact's default queueMicrotask.
options.debounceRendering = (flush) => void Promise.resolve().then(flush);
