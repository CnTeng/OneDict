import { render } from "preact";
import { ContentPopover } from "./popover";
import contentStyles from "./content.css?inline";

const host = document.createElement("div");
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
