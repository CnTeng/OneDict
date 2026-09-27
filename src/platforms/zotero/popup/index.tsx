import { extractContext } from "@common/context";
import { AppServices } from "@services/app";
import { HtmlAudioService } from "@services/audio";
import { LookupPanel } from "@views/lookup-panel";
import { render } from "preact";
import { observeDetachedRoot } from "../mount";
import { configureZoteroPreact } from "../preact";
import popupStyle from "./popup.css?inline";

let audioService: HtmlAudioService | undefined;
const mountedPopups = new Set<() => void>();

function getAudioService() {
  audioService ??= new HtmlAudioService(Zotero.getMainWindow().document);
  return audioService;
}

const handler = (event: _ZoteroTypes.Reader.EventParams<"renderTextSelectionPopup">) => {
  const services = new AppServices();
  const { reader, params, append } = event;
  // Zotero obtains this document through `event.detail.wrappedJSObject`, whose
  // Xray waiver is transitive. Rewrap it so UI-library expandos and event
  // callbacks are observed through the same chrome-side DOM reflector.
  const doc: Document = Cu.unwaiveXrays(event.doc);
  const popup = doc.querySelector(".selection-popup") as HTMLDivElement;
  popup.style.maxWidth = "none";

  const expression = params.annotation.text.trim();

  const readerWindow = reader?._iframeWindow?.[0];
  const selection = readerWindow?.getSelection?.();
  const range = selection?.rangeCount ? selection.getRangeAt(0) : undefined;
  const context = extractContext(range);

  const container = doc.createElement("div");
  container.className = "onedict-popup label-popup";

  const style = doc.createElement("style");
  style.textContent = popupStyle;
  container.append(style);
  configureZoteroPreact();
  const root = doc.createElement("div");
  root.className = "flex min-h-0 flex-1 flex-col";
  render(
    <LookupPanel
      ownerDocument={doc}
      tasks={services.dictionary.lookup(expression, context ?? undefined)}
      request={{ word: expression, context: context ?? undefined }}
      ankiService={services.anki}
      audioService={getAudioService()}
    />,
    root,
  );
  container.append(root);

  append(container);

  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    stopObserving();
    render(null, root);
    mountedPopups.delete(dispose);
  };
  const stopObserving = observeDetachedRoot(root, dispose);
  mountedPopups.add(dispose);
};

let registeredPluginId: string | null = null;

export function registerPopup(pluginId: string) {
  if (registeredPluginId) return;
  Zotero.Reader.registerEventListener("renderTextSelectionPopup", handler, pluginId);
  registeredPluginId = pluginId;
}

export function unregisterPopup() {
  [...mountedPopups].forEach((dispose) => dispose());
  if (!registeredPluginId) return;

  Zotero.Reader.unregisterEventListener("renderTextSelectionPopup", handler);

  const readerWithPluginCleanup = Zotero.Reader as typeof Zotero.Reader & {
    _unregisterEventListenerByPluginID?: (pluginId: string) => void;
  };
  readerWithPluginCleanup._unregisterEventListenerByPluginID?.(registeredPluginId);
  registeredPluginId = null;
}
