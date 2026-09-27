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
import { LucideIcon } from "@views/components/icon";
import { Search } from "lucide";
import { render } from "preact";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import contentStyles from "./content.css?inline";

interface SelectedText {
  word: string;
  context: Context;
  reference: ReferenceElement;
}

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
      if (event.composedPath().includes(host)) return;
      const selection = view.getSelection();
      if (!selection?.rangeCount) return;

      const word = selection.toString().trim();
      if (!word || word.length > 100) return;

      const range = selection.getRangeAt(0);
      const context = extractContext(range, doc.documentElement.lang);
      if (!context) return;

      setButtonVisible(false);
      setSelected({ word, context, reference: range });
    };

    const onMouseDown = (event: MouseEvent) => {
      const path = event.composedPath();
      if (path.includes(button) || path.includes(popover)) return;
      setButtonVisible(false);
    };

    view.addEventListener("message", onMessage);
    doc.addEventListener("mouseup", onMouseUp);
    doc.addEventListener("mousedown", onMouseDown);

    return () => {
      view.removeEventListener("message", onMessage);
      doc.removeEventListener("mouseup", onMouseUp);
      doc.removeEventListener("mousedown", onMouseDown);
    };
  }, [host]);

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const popover = popoverRef.current;
    if (!selected || !button || !popover) return;
    let active = true;
    const options = {
      placement: "right-start" as const,
      middleware: [inline(), offset(8), shift({ padding: 8 }), flip()],
      strategy: "absolute" as const,
    };

    void computePosition(selected.reference, button, options).then(({ x, y }) => {
      if (!active) return;
      setButtonPosition({ x, y });
      setButtonVisible(true);
    });
    void computePosition(selected.reference, popover, options).then(({ x, y }) => {
      if (active) setPopoverPosition({ x, y });
    });

    return () => {
      active = false;
    };
  }, [selected]);

  useEffect(() => {
    const popover = popoverRef.current;
    if (!popoverOpen || !selected || !popover) return;
    let active = true;
    const stop = autoUpdate(selected.reference, popover, () => {
      void computePosition(selected.reference, popover, {
        placement: "right-start",
        middleware: [inline(), offset(8), shift({ padding: 8 }), flip()],
        strategy: "absolute",
      }).then(({ x, y }) => {
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
          position: "absolute",
          display: buttonVisible ? "" : "none",
          left: `${buttonPosition.x}px`,
          top: `${buttonPosition.y}px`,
          zIndex: 2147483647,
        }}
        onClick={() => setButtonVisible(false)}
      >
        <LucideIcon iconNode={Search} />
      </button>
      <div
        ref={popoverRef}
        class="onedict-popover"
        popover="auto"
        style={{
          position: "absolute",
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
const style = document.createElement("style");
style.textContent = contentStyles;
const root = document.createElement("div");
shadow.append(style, root);
document.documentElement.append(host);

render(<ContentPopover host={host} />, root);
window.addEventListener(
  "pagehide",
  () => {
    render(null, root);
    host.remove();
  },
  { once: true },
);
