import { i18n } from "@common/i18n";
import { render } from "preact";
import { ContentPopover } from "./popover";
import contentStyles from "./content.css?inline";

void i18n.changeLanguage(chrome.i18n.getUILanguage());

const host = document.createElement("div");
host.lang = i18n.resolvedLanguage ?? "en";
const shadow = host.attachShadow({ mode: "open" });

function mount() {
  document.documentElement.append(host);
  render(
    <>
      <style>{contentStyles}</style>
      <ContentPopover host={host} />
    </>,
    shadow,
  );
}

mount();
window.addEventListener("pageshow", (event) => {
  if (event.persisted) mount();
});
window.addEventListener("pagehide", () => {
  render(null, shadow);
  host.remove();
});
