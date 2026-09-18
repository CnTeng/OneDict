import { BrowserPlatformServices } from "@services/browser";
import { OptionsPage } from "@views/options";
import { cn } from "cn";

const root = document.createElement("div");
root.className = cn("mx-auto min-h-screen max-w-3xl px-4 py-8 sm:py-10");

document.body.append(root);

const services = new BrowserPlatformServices();
const page = new OptionsPage({
  container: root,
  configService: services.config,
  dictionaryService: services.dictionary,
  ankiService: services.anki,
});

window.addEventListener("pagehide", () => page.dispose(), { once: true });
