import "./runtime";
import { errorMessage } from "@common/error";
import { registerPopup, unregisterPopup } from "./popup";
import { mountPrefs, registerPrefs, unregisterPrefs } from "./prefs";
import "./prefs/prefs.css";

type ZoteroWithOneDict = typeof Zotero & {
  OneDict?: {
    mountPrefs: (doc: Document) => void;
  };
};

const zoteroWithOneDict = Zotero as ZoteroWithOneDict;

function registerGlobals(): void {
  zoteroWithOneDict.OneDict = { mountPrefs };
}

function unregisterGlobals(): void {
  delete zoteroWithOneDict.OneDict;
}

export function install() {}

export function uninstall() {
  unregisterPopup();
  unregisterPrefs();
  unregisterGlobals();
}

export async function startup(
  params: { id: string; version: string; rootURI: string },
  _reason: number,
) {
  await Zotero.initializationPromise;

  registerGlobals();
  registerPopup(params.id);
  await registerPrefs(params.id).catch((error) => {
    Zotero.logError(error);
    Zotero.log(`Failed to register OneDict preferences pane: ${errorMessage(error)}`);
  });
}

export function shutdown() {
  unregisterPopup();
  unregisterPrefs();
  unregisterGlobals();
}
