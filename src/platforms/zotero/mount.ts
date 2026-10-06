import { type ComponentChildren, render } from "preact";

export function mountRoot(root: HTMLElement, content: ComponentChildren, onDispose: () => void) {
  render(content, root);

  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    view?.removeEventListener("pagehide", dispose);
    render(null, root);
    onDispose();
  };
  const view = root.ownerDocument.defaultView;
  const observer =
    view &&
    new view.MutationObserver(() => {
      if (!root.isConnected) dispose();
    });

  observer?.observe(root.ownerDocument, { childList: true, subtree: true });
  view?.addEventListener("pagehide", dispose, { once: true });

  return dispose;
}
