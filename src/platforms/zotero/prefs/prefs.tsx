import { OptionsPage } from "@views/options";
import { createAppServices } from "../app";
import { mountRoot } from "../mount";

let registeredPaneId: string | null = null;
const mountedPrefs = new Map<Document, () => void>();

export function mountPrefs(document: Document) {
  // Keep Preact's DOM expandos and event callbacks on the same chrome-side reflector.
  const doc: Document = Cu.unwaiveXrays(document);
  const root = doc.getElementById("onedict-prefpane-main");
  if (!root) return;

  const services = createAppServices();

  mountedPrefs.get(doc)?.();
  const dispose = mountRoot(
    root,
    <OptionsPage
      configService={services.config}
      ankiService={services.anki}
      aiService={services.ai}
      fileService={services.file}
      onOpenLink={(url) => Zotero.launchURL(url)}
    />,
    () => {
      if (mountedPrefs.get(doc) === dispose) mountedPrefs.delete(doc);
    },
  );
  mountedPrefs.set(doc, dispose);
}

export async function registerPrefs(pluginId: string) {
  if (registeredPaneId) return;
  registeredPaneId = await Zotero.PreferencePanes.register({
    pluginID: pluginId,
    id: "onedict-prefpane",
    label: "One dictionary",
    image: "assets/icons/icon48.png",
    src: "prefs/prefs.xhtml",
    stylesheets: ["prefs/prefs.css"],
  });
}

export function unregisterPrefs() {
  [...mountedPrefs.values()].forEach((dispose) => dispose());
  if (!registeredPaneId) return;
  Zotero.PreferencePanes.unregister(registeredPaneId);
  registeredPaneId = null;
}
