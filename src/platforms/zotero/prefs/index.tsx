import { AppServices } from "@services/app";
import { OptionsPage } from "@views/options";
import { render } from "preact";
import { observeDetachedRoot } from "../mount";
import { configureZoteroPreact } from "../preact";

let registeredPaneId: string | null = null;
const mountedPrefs = new Map<Document, () => void>();

export function mountPrefs(doc: Document) {
  const root = doc.getElementById("onedict-prefpane-main");
  if (!root) return;

  const services = new AppServices();

  mountedPrefs.get(doc)?.();
  configureZoteroPreact();
  render(
    <OptionsPage ownerDocument={doc} configService={services.config} ankiService={services.anki} />,
    root,
  );
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    stopObserving();
    render(null, root);
    if (mountedPrefs.get(doc) === dispose) mountedPrefs.delete(doc);
  };
  const stopObserving = observeDetachedRoot(root, dispose);
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
