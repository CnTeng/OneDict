import { i18n, t } from "@common/i18n";
import { OptionsPage } from "@views/options";
import { cn } from "cn";
import { render } from "preact";
import { createAppServices } from "../app";

const root = document.createElement("div");
root.className = cn("mx-auto min-h-screen max-w-3xl px-4 py-8 sm:py-10");

const services = createAppServices();
void i18n.changeLanguage(chrome.i18n.getUILanguage());
document.documentElement.lang = i18n.resolvedLanguage ?? "en";
document.title = `One dictionary ${t("settings.title")}`;
render(
  <OptionsPage
    configService={services.config}
    ankiService={services.anki}
    aiService={services.ai}
  />,
  root,
);
document.body.append(root);
window.addEventListener(
  "pagehide",
  () => {
    render(null, root);
  },
  { once: true },
);
