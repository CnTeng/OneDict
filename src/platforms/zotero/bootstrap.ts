import "./runtime";
import { errorMessage } from "@common/error";
import { i18n } from "@common/i18n";
import { registerPopup, unregisterPopup } from "./popup/popup";
import { mountPrefs, registerPrefs, unregisterPrefs } from "./prefs/prefs";
import "./prefs/prefs.css";

type ZoteroWithOneDict = typeof Zotero & {
  OneDict?: {
    mountPrefs: (doc: Document) => void;
  };
};

const zoteroWithOneDict = Zotero as ZoteroWithOneDict;

export function install() {}

export function uninstall() {
  shutdown();
}

export async function startup(
  params: { id: string; version: string; rootURI: string },
  _reason: number,
) {
  await Zotero.initializationPromise;

  void i18n.changeLanguage(Zotero.locale);

  zoteroWithOneDict.OneDict = { mountPrefs };
  registerPopup(params.id);
  await registerPrefs(params.id).catch((error) => {
    Zotero.logError(error);
    Zotero.log(`Failed to register OneDict preferences pane: ${errorMessage(error)}`);
  });
}

export function shutdown() {
  unregisterPopup();
  unregisterPrefs();
  delete zoteroWithOneDict.OneDict;
}
