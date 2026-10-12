<p align="center">
  <img src="src/assets/icons/icon.svg" width="96" height="96" alt="One Dictionary logo">
</p>

# One Dictionary

Look up words, explain text with AI, and add cards to Anki — in Chrome, Firefox, and Zotero.

## Features

- Dictionary lookup with definitions, examples, pronunciation, and context.
- AI explanations through OpenAI-compatible providers, with streaming and editable Markdown.
- AnkiConnect integration with **OneDict Word** and **OneDict Text** note types.
- English and Simplified Chinese interfaces, following the platform language.

Supported dictionaries: **Youdao**, **Bing**, **Zdic** (Chinese), and **Jisho** (Japanese).

## Installation

Supports Chrome 119+, Firefox 125+, and Zotero 7–10. Node.js 24+ and npm are recommended for building.

```bash
npm ci
npm run build
npm run package
```

For a single platform, use `npm run build:chrome` or `npm run package:chrome`, replacing `chrome` with `firefox` or `zotero` as needed.

- **Chrome:** Open `chrome://extensions`, enable **Developer mode**, and **Load unpacked** from `dist/chrome`.
- **Firefox:** Open `about:debugging` → **This Firefox → Load Temporary Add-on**, then select `dist/firefox/manifest.json`. Temporary installation lasts until Firefox restarts.
- **Zotero:** Open **Tools → Plugins** and drag `dist/onedict-zotero-v<version>.xpi` onto the Plugins window.

## Usage

Select a word or passage, then choose a dictionary or AI from the sidebar. Selecting AI starts an explanation immediately; click **+** to add a result to Anki.

- **AI setup:** Enter an API base URL and key, **Fetch Models**, select a chat model and explanation language, then **Save**. Local providers may not require a key.
- **Anki setup:** Install [AnkiConnect](https://git.sr.ht/~foosoft/anki-connect) and keep Anki running. **Fetch Decks**, select a deck, **Save**, then run **Setup Template**.

Settings require explicit saving. Browser settings, including AI credentials, use browser sync storage; Zotero uses local preferences. They do not sync between platforms.

## References

- [ODH](https://github.com/ninja33/ODH)
- [Saladict](https://github.com/crimx/ext-saladict)
- [zotero-odh](https://github.com/1ywan/zotero-odh)

## License

[MIT](LICENSE)
