import { HtmlAudioService } from "@services/audio";

export const audioService = new HtmlAudioService(
  () =>
    // Zotero's main window is a XUL document; explicitly create an HTML audio element.
    Zotero.getMainWindow().document.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "audio",
    ) as HTMLAudioElement,
);
