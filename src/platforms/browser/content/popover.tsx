import { extractContext } from "@common/context";
import type { LookupRequest } from "@common/types";
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
import { useLayoutEffect, useRef } from "preact/hooks";

const positionOptions = {
  placement: "right-start" as const,
  middleware: [inline(), offset(8), flip(), shift({ padding: 8 })],
  strategy: "fixed" as const,
};

export function ContentPopover({ host }: { host: HTMLElement }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const popover = popoverRef.current;
    const iframe = iframeRef.current;
    if (!button || !popover || !iframe) return;

    const controller = new AbortController();
    const options = { signal: controller.signal };
    let request: LookupRequest | undefined;
    let reference: ReferenceElement | undefined;
    let frameReady = false;
    let stopButton: (() => void) | undefined;
    let stopPopover: (() => void) | undefined;

    button.popoverTargetElement = popover;
    button.popoverTargetAction = "toggle";

    const trackPosition = (element: HTMLElement) => {
      if (!reference) return;
      const currentReference = reference;
      let active = true;
      const stop = autoUpdate(currentReference, element, () => {
        void computePosition(currentReference, element, positionOptions).then(({ x, y }) => {
          if (!active) return;
          Object.assign(element.style, { left: `${x}px`, top: `${y}px`, visibility: "visible" });
          if (element === popover) iframe.style.visibility = "visible";
        });
      });
      return () => {
        active = false;
        stop();
      };
    };

    const hideButton = () => {
      stopButton?.();
      button.style.display = "none";
    };

    const sendLookup = () => {
      if (!frameReady || !request || !popover.matches(":popover-open")) return;
      iframe.contentWindow?.postMessage({ action: "onedict:lookup", data: request }, "*");
    };

    window.addEventListener(
      "message",
      (event) => {
        if (event.source !== iframe.contentWindow || event.data?.action !== "onedict:ready") return;
        frameReady = true;
        sendLookup();
      },
      options,
    );
    document.addEventListener(
      "mouseup",
      (event) => {
        if (event.composedPath().includes(host)) return;
        const selection = document.getSelection();
        if (!selection?.rangeCount) return;
        const text = selection.toString().trim();
        if (!text) return;
        const range = selection.getRangeAt(0);
        if (range.collapsed || !range.getClientRects()?.length) return;

        hideButton();
        request = {
          text,
          context: extractContext(range, document.documentElement.lang) ?? {
            context: "",
            lang: document.documentElement.lang,
          },
        };
        reference = {
          getBoundingClientRect: () => range.getBoundingClientRect(),
          getClientRects: () => range.getClientRects() ?? [],
          contextElement:
            range.commonAncestorContainer instanceof Element
              ? range.commonAncestorContainer
              : (range.commonAncestorContainer.parentElement ?? document.documentElement),
        };
        Object.assign(button.style, { display: "", visibility: "hidden" });
        stopButton = trackPosition(button);
        if (popover.matches(":popover-open")) {
          stopPopover?.();
          stopPopover = trackPosition(popover);
          sendLookup();
        }
      },
      options,
    );
    document.addEventListener(
      "mousedown",
      (event) => {
        const path = event.composedPath();
        if (!path.includes(button) && !path.includes(popover)) hideButton();
      },
      options,
    );
    button.addEventListener("click", hideButton, options);
    popover.addEventListener(
      "toggle",
      () => {
        stopPopover?.();
        iframe.style.visibility = "hidden";
        if (!popover.matches(":popover-open")) return;
        stopPopover = trackPosition(popover);
        sendLookup();
      },
      options,
    );

    return () => {
      controller.abort();
      stopButton?.();
      stopPopover?.();
    };
  }, [host]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        class="onedict-floating-btn"
        title="Search in One dictionary"
        style={{ display: "none" }}
      >
        <Search />
      </button>
      <div ref={popoverRef} class="onedict-popover" popover="auto">
        <iframe
          ref={iframeRef}
          src={chrome.runtime.getURL("platforms/browser/content/frame.html")}
          class="onedict-frame"
          loading="lazy"
          style={{ visibility: "hidden" }}
        />
      </div>
    </>
  );
}
