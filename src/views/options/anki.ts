import type { AnkiConfig, IAnkiConfigService, IAnkiService, SelectOption } from "@common/types";
import { Icon, createButton, createInput, createSelect, setButtonLoading } from "@views/components";
import { cn } from "cn";
import { RefreshCw } from "lucide";
import {
  SectionIntro,
  SelectOptions,
  SettingsGroup,
  SettingsRow,
  type StatusLevel,
} from "./elements";

export interface AnkiOptionsDependencies {
  container: HTMLElement;
  ankiService: IAnkiService;
  configService: IAnkiConfigService;
  showStatus: (level: StatusLevel, message: string) => void;
}

export class AnkiOptions {
  readonly element: HTMLElement;

  private readonly document: Document;
  private readonly ankiService: IAnkiService;
  private readonly configService: IAnkiConfigService;
  private readonly showStatus: (level: StatusLevel, message: string) => void;

  private readonly urlInput: HTMLInputElement;
  private readonly deckSelect: HTMLSelectElement;
  private readonly refreshButton: HTMLButtonElement;
  private readonly setupButton: HTMLButtonElement;

  private config: AnkiConfig = { connectUrl: "", deck: "" };
  private deckOptions: SelectOption[] = [];
  private readonly unsubscribeConfigChange: () => void;

  constructor({ container, ankiService, configService, showStatus }: AnkiOptionsDependencies) {
    this.document = container.ownerDocument;
    this.ankiService = ankiService;
    this.configService = configService;
    this.showStatus = showStatus;

    this.element = this.document.createElement("section");
    this.element.className = cn("space-y-4");

    this.urlInput = createInput({
      doc: this.document,
      id: "anki-url",
      placeholder: this.config.connectUrl,
    });

    this.deckSelect = createSelect({ doc: this.document, id: "anki-deck" });

    this.refreshButton = createButton({
      doc: this.document,
      title: "Refresh Decks",
      variant: "outline",
      className: "w-full sm:w-auto",
    });
    this.refreshButton.append(
      new Icon({
        doc: this.document,
        iconNode: RefreshCw,
        customAttrs: { width: 16, height: 16 },
      }).element,
      this.document.createTextNode("Refresh"),
    );

    this.setupButton = createButton({
      doc: this.document,
      title: "Create or upgrade the optimized Anki-Lex Modern note type in Anki",
      variant: "outline",
      className: "w-full text-left whitespace-normal sm:max-w-52 sm:justify-self-start",
    });
    this.setupButton.append(this.document.createTextNode("Setup Template"));

    this.renderStructure();

    this.registerListeners();
    this.unsubscribeConfigChange = this.configService.onDidChange((config) => {
      this.updateConfig(config);
      this.render();
    });
    void this.load().catch((error) => {
      this.showActionError("Failed to load Anki settings", error);
    });
    container.append(this.element);
  }

  dispose() {
    this.unsubscribeConfigChange();
  }

  updateConfig(config: AnkiConfig) {
    this.config = config;
  }

  render() {
    this.urlInput.value = this.config.connectUrl;
    const deckOptions = this.deckOptions.some(({ value }) => value === this.config.deck)
      ? this.deckOptions
      : [{ value: this.config.deck, label: this.config.deck }, ...this.deckOptions].filter(
          ({ value }) => value,
        );
    new SelectOptions(
      this.document,
      this.deckSelect,
      [{ value: "", label: "No deck" }, ...deckOptions],
      this.config.deck,
    ).render();
  }

  private async load() {
    const [config, decks] = await Promise.all([
      this.configService.get(),
      this.ankiService.getDecks().catch(() => []),
    ]);
    this.updateConfig(config);
    this.deckOptions = this.toSelectOptions(decks);
    this.render();
  }

  private renderStructure() {
    const group = new SettingsGroup(this.document, [
      new SettingsRow(this.document, "AnkiConnect URL", {
        htmlFor: "anki-url",
        children: this.renderControlRow([this.urlInput, this.refreshButton]),
      }).element,
      new SettingsRow(this.document, "Deck", {
        htmlFor: "anki-deck",
        children: this.deckSelect,
        description: "New cards are always added to this deck.",
      }).element,
      new SettingsRow(this.document, "Template", {
        children: this.renderControlRow([this.setupButton]),
        description: "Generated cards always use the built-in Anki-Lex Modern note type.",
      }).element,
    ]).element;

    this.element.append(
      new SectionIntro(
        this.document,
        "Anki",
        "Connect to Anki, choose where cards are saved, and keep the template up to date.",
      ).element,
      group,
    );
  }

  private renderControlRow(children: HTMLElement[]) {
    const row = this.document.createElement("div");
    row.className = cn("flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center");
    row.append(...children);
    return row;
  }

  private registerListeners() {
    this.urlInput.addEventListener("input", () => {
      this.config = {
        ...this.config,
        connectUrl: this.urlInput.value,
      };
      void this.configService.update(this.config).catch((error) => {
        this.showActionError("Failed to save AnkiConnect URL", error);
      });
    });

    this.deckSelect.addEventListener("change", () => {
      this.config = {
        ...this.config,
        deck: this.deckSelect.value,
      };
      void this.configService.update(this.config).catch((error) => {
        this.showActionError("Failed to save Anki deck", error);
      });
    });

    this.refreshButton.addEventListener("click", () => {
      void this.refreshAnkiState();
    });

    this.setupButton.addEventListener("click", () => {
      void this.syncTemplate();
    });
  }

  private async refreshAnkiState() {
    setButtonLoading(this.refreshButton, true);
    this.showStatus("info", "Connecting to Anki...");

    await this.ankiService
      .getDecks()
      .then((decks) => {
        this.deckOptions = this.toSelectOptions(decks);
        this.render();
        this.showStatus("success", "Anki connection successful!");
      })
      .catch((error) => {
        this.showStatus(
          "warning",
          `Failed to connect to Anki: ${error instanceof Error ? error.message : String(error)}`,
        );
      })
      .finally(() => {
        setButtonLoading(this.refreshButton, false);
      });
  }

  private async syncTemplate() {
    setButtonLoading(this.setupButton, true);
    this.showStatus("info", "Processing Anki template...");

    await this.ankiService
      .syncTemplate()
      .then(() => {
        this.showStatus("success", "Anki template is up to date!");
      })
      .catch((error) => {
        this.showStatus(
          "error",
          `Processing failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      })
      .finally(() => {
        setButtonLoading(this.setupButton, false);
      });
  }

  private showActionError(message: string, error: unknown) {
    this.showStatus(
      "error",
      `${message}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  private toSelectOptions(values: string[]): SelectOption[] {
    return values.map((value) => ({ value, label: value }));
  }
}
