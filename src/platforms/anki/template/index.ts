import bundle from "../index.tsx?name=AnkiCard&base64&iife";
import textBackHbs from "./text-back.hbs?raw";
import textFrontHbs from "./text-front.hbs?raw";
import backHbs from "./word-back.hbs?raw";
import frontHbs from "./word-front.hbs?raw";
import css from "./card.css?inline";

export const ANKI_CARD_SCRIPT = { filename: "_onedict.js", data: bundle };

export const ANKI_MODEL_TEMPLATE = {
  Name: "OneDict Word",
  Front: frontHbs,
  Back: backHbs,
};

export const ANKI_MODEL_CSS = css;

export const ANKI_TEXT_MODEL_TEMPLATE = {
  Name: "OneDict Text",
  Front: textFrontHbs,
  Back: textBackHbs,
};
