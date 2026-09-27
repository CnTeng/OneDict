export function observeDetachedRoot(root: Element, dispose: () => void) {
  const view = root.ownerDocument.defaultView;
  const observer =
    view &&
    new view.MutationObserver(() => {
      if (!root.isConnected) dispose();
    });

  observer?.observe(root.ownerDocument, { childList: true, subtree: true });
  view?.addEventListener("pagehide", dispose, { once: true });

  return () => {
    observer?.disconnect();
    view?.removeEventListener("pagehide", dispose);
  };
}
