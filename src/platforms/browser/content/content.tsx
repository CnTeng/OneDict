import { extractContext } from "@common/context";
import type { Context } from "@common/types";
import {
  type ReferenceElement,
  autoUpdate,
  computePosition,
  flip,
  inline,
  offset,
  shift,
} from "@floating-ui/dom";
import { Search } from "lucide-preact";
import { render } from "preact";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import contentStyles from "./content.css?inline";

interface SelectedText {
  word: string;
  context: Context;
  reference: ReferenceElement;
}

const positionOptions = {
  placement: "right-start" as const,
  middleware: [inline(), offset(8), flip(), shift({ padding: 8 })],
  strategy: "fixed" as const,
};

function ContentPopover({ host }: { host: HTMLElement }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selected, setSelected] = useState<SelectedText>();
  const [buttonVisible, setButtonVisible] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [frameGeneration, setFrameGeneration] = useState(0);

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const popover = popoverRef.current;
    const iframe = iframeRef.current;
    if (!button || !popover || !iframe) return;

    const doc = host.ownerDocument;
    const view = doc.defaultView;
    if (!view) return;

    button.popoverTargetElement = popover;
    button.popoverTargetAction = "toggle";

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow || event.data?.action !== "onedict:ready") return;
      setFrameGeneration((generation) => generation + 1);
    };

    const onMouseUp = (event: MouseEvent) => {
      const path = event.composedPath();
      if (path.includes(host)) return;
      const selection = view.getSelection();
      if (!selection?.rangeCount) return;

      const word = selection.toString().trim();
      if (!word) return;

      const shadowRoots = path.filter(
        (node): node is ShadowRoot => node instanceof view.ShadowRoot,
      );
      const composedRange = selection.getComposedRanges?.({ shadowRoots })[0];
      const range = doc.createRange();
      if (composedRange) {
        range.setStart(composedRange.startContainer, composedRange.startOffset);
        range.setEnd(composedRange.endContainer, composedRange.endOffset);
      } else {
        // Older Chromium exposes selections through ShadowRoot.getSelection().
        const scopedSelection =
          shadowRoots
            .map((root) => {
              if (!("getSelection" in root) || typeof root.getSelection !== "function") return;
              const current = root.getSelection();
              return current instanceof view.Selection ? current : undefined;
            })
            .find((current) => current?.rangeCount && !current.getRangeAt(0).collapsed) ??
          selection;
        const selectedRange = scopedSelection.getRangeAt(0);
        range.setStart(selectedRange.startContainer, selectedRange.startOffset);
        range.setEnd(selectedRange.endContainer, selectedRange.endOffset);
      }
      if (range.collapsed || !range.getClientRects()?.length) return;
      const context = extractContext(range, doc.documentElement.lang) ?? {
        context: "",
        lang: doc.documentElement.lang,
      };

      setButtonVisible(false);
      setSelected({
        word,
        context,
        reference: {
          getBoundingClientRect: () => range.getBoundingClientRect(),
          getClientRects: () => range.getClientRects() ?? [],
          contextElement:
            range.commonAncestorContainer.nodeType === view.Node.ELEMENT_NODE
              ? (range.commonAncestorContainer as Element)
              : (range.commonAncestorContainer.parentElement ?? doc.documentElement),
        },
      });
    };

    const onMouseDown = (event: MouseEvent) => {
      const path = event.composedPath();
      if (path.includes(button) || path.includes(popover)) return;
      setButtonVisible(false);
    };

    const controller = new view.AbortController();
    view.addEventListener("message", onMessage, { signal: controller.signal });
    doc.addEventListener("mouseup", onMouseUp, { signal: controller.signal });
    doc.addEventListener("mousedown", onMouseDown, { signal: controller.signal });

    return () => controller.abort();
  }, [host]);

  useLayoutEffect(() => {
    const button = buttonRef.current;
    if (!selected || !button) return;
    let active = true;

    void computePosition(selected.reference, button, positionOptions).then(({ x, y }) => {
      if (!active) return;
      setButtonPosition({ x, y });
      setButtonVisible(true);
    });

    return () => {
      active = false;
    };
  }, [selected]);

  useEffect(() => {
    const button = buttonRef.current;
    if (!buttonVisible || !selected || !button) return;
    let active = true;
    const stop = autoUpdate(selected.reference, button, () => {
      void computePosition(selected.reference, button, positionOptions).then(({ x, y }) => {
        if (active) setButtonPosition({ x, y });
      });
    });
    return () => {
      active = false;
      stop();
    };
  }, [buttonVisible, selected]);

  useEffect(() => {
    const popover = popoverRef.current;
    if (!popoverOpen || !selected || !popover) return;
    let active = true;
    const stop = autoUpdate(selected.reference, popover, () => {
      void computePosition(selected.reference, popover, positionOptions).then(({ x, y }) => {
        if (active) setPopoverPosition({ x, y });
      });
    });
    return () => {
      active = false;
      stop();
    };
  }, [popoverOpen, selected]);

  useEffect(() => {
    if (!frameGeneration || !popoverOpen || !selected) return;
    iframeRef.current?.contentWindow?.postMessage(
      { action: "onedict:lookup", data: { word: selected.word, context: selected.context } },
      "*",
    );
  }, [frameGeneration, popoverOpen, selected]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        class="onedict-floating-btn"
        title="Search in One dictionary"
        style={{
          position: "fixed",
          display: selected ? "" : "none",
          visibility: buttonVisible ? "visible" : "hidden",
          left: `${buttonPosition.x}px`,
          top: `${buttonPosition.y}px`,
          zIndex: 2147483647,
        }}
        onClick={() => setButtonVisible(false)}
      >
        <Search />
      </button>
      <div
        ref={popoverRef}
        class="onedict-popover"
        popover="auto"
        style={{
          position: "fixed",
          left: `${popoverPosition.x}px`,
          top: `${popoverPosition.y}px`,
          zIndex: 2147483647,
        }}
        onToggle={(event) => setPopoverOpen(event.newState === "open")}
      >
        <iframe
          ref={iframeRef}
          src={chrome.runtime.getURL("platforms/browser/content/frame.html")}
          class="onedict-frame"
          loading="lazy"
          style={{ visibility: popoverOpen ? "visible" : "hidden" }}
        />
      </div>
    </>
  );
}

const host = document.createElement("div");
const shadow = host.attachShadow({ mode: "open" });
document.documentElement.append(host);

render(
  <>
    <style>{contentStyles}</style>
    <ContentPopover host={host} />
  </>,
  shadow,
);
window.addEventListener(
  "pagehide",
  () => {
    render(null, shadow);
    host.remove();
  },
  { once: true },
);
