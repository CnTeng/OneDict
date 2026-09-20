import type {
  DictionaryConfig,
  DictionaryProviderInfo,
  IDictionaryConfigService,
  IDictionaryService,
} from "@common/types";
import { SortableList, createButton, createSelect } from "@views/components";
import { cn } from "cn";
import { SectionIntro, SettingsGroup, SettingsRow } from "./elements";

export interface DictionaryOptionsDependencies {
  container: HTMLElement;
  configService: IDictionaryConfigService;
  dictionaryService: IDictionaryService;
}

export class DictionaryOptions {
  readonly element: HTMLElement;

  private readonly document: Document;
  private readonly configService: IDictionaryConfigService;
  private readonly dictionaryService: IDictionaryService;
  private readonly languageDisplayNames = new Intl.DisplayNames(["en"], { type: "language" });
  private readonly rulesBody: HTMLDivElement;
  private readonly addProviderSelect: HTMLSelectElement;
  private readonly addButton: HTMLButtonElement;
  private config: DictionaryConfig = [];
  private providers: DictionaryProviderInfo[];
  private readonly unsubscribeConfigChange: () => void;

  constructor({ container, configService, dictionaryService }: DictionaryOptionsDependencies) {
    this.document = container.ownerDocument;
    this.configService = configService;
    this.dictionaryService = dictionaryService;
    this.providers = [];

    this.element = this.document.createElement("section");
    this.element.className = cn("space-y-4");

    this.rulesBody = this.document.createElement("div");
    this.rulesBody.className = cn("space-y-2");

    this.addProviderSelect = this.createSelect();
    this.addButton = createButton({
      doc: this.document,
      variant: "outline",
      className: "w-full sm:w-auto",
    });
    this.addButton.append(this.document.createTextNode("Add"));

    this.renderStructure();
    this.registerListeners();
    this.unsubscribeConfigChange = this.configService.onDidChange((config) => {
      this.updateConfig(config);
      this.render();
    });
    this.render();
    void this.load().catch((error) => {
      this.showConfigError(error);
    });
    container.append(this.element);
  }

  dispose() {
    this.unsubscribeConfigChange();
  }

  updateConfig(config: DictionaryConfig) {
    this.config = config;
  }

  async load() {
    const [config, providers] = await Promise.all([
      this.configService.get(),
      this.dictionaryService.getProviders(),
    ]);
    this.config = config;
    this.providers = providers;
    this.render();
  }

  render() {
    const dictionaryConfig = this.config;
    const providers = this.providers;
    const enabledProviders = new Set(dictionaryConfig.map((config) => config.provider));
    const availableProviders = providers.filter((provider) => !enabledProviders.has(provider.id));
    const providersById = new Map(providers.map((provider) => [provider.id, provider]));

    this.renderAddProviderOptions(availableProviders);
    this.renderRuleRows(dictionaryConfig, providersById);
  }

  private renderStructure() {
    this.element.append(
      new SectionIntro(this.document, "Dictionary", "Add providers and sort their lookup priority.")
        .element,
      this.renderAddProviderRow(),
      this.rulesBody,
    );
  }

  private renderAddProviderRow() {
    const controls = this.document.createElement("div");
    controls.className = cn("flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center");
    controls.append(this.addProviderSelect, this.addButton);

    return new SettingsGroup(this.document, [
      new SettingsRow(this.document, "Provider", {
        description: "Add a dictionary source to the lookup priority list.",
        children: controls,
      }).element,
    ]).element;
  }

  private renderAddProviderOptions(availableProviders: DictionaryProviderInfo[]) {
    this.addProviderSelect.replaceChildren(
      ...(availableProviders.length > 0
        ? availableProviders
        : [{ id: "", name: "All providers already added", supportedLanguages: [] }]
      ).map((provider) => {
        const option = this.document.createElement("option");
        option.value = provider.id;
        option.textContent = provider.name;
        return option;
      }),
    );
    this.addProviderSelect.disabled = availableProviders.length === 0;
    this.addButton.disabled = availableProviders.length === 0;
  }

  private renderRuleRows(
    dictionaryConfig: DictionaryConfig,
    providersById: Map<string, DictionaryProviderInfo>,
  ) {
    if (dictionaryConfig.length === 0) {
      const empty = this.document.createElement("p");
      empty.className = cn("border-border text-muted-foreground rounded-md border p-4 text-sm");
      empty.textContent = "No providers added.";
      this.rulesBody.replaceChildren(empty);
      return;
    }

    const rows = this.document.createElement("div");
    rows.className = cn("border-border overflow-hidden rounded-md border");
    rows.append(
      this.createRulesHeader(),
      new SortableList({
        doc: this.document,
        className: "divide-border divide-y",
        items: dictionaryConfig,
        getItemId: (config) => config.provider,
        onReorder: (providerId, targetIndex) => {
          void this.configService.reorderProvider(providerId, targetIndex).catch((error) => {
            this.showConfigError(error);
          });
        },
        renderItem: (config, { dragHandle }) => {
          return this.createRuleRow(config, providersById.get(config.provider), dragHandle);
        },
      }).element,
    );
    this.rulesBody.replaceChildren(rows);
  }

  private createRulesHeader() {
    const row = this.document.createElement("div");
    row.className = cn(
      "bg-muted/30 text-muted-foreground hidden px-4 py-2 text-xs font-medium md:grid md:grid-cols-[auto_minmax(0,1.2fr)_minmax(0,1fr)_auto] md:gap-3",
    );

    ["", "Provider", "Languages", ""].forEach((text) => {
      const cell = this.document.createElement("div");
      cell.textContent = text;
      row.append(cell);
    });

    return row;
  }

  private createRuleRow(
    config: DictionaryConfig[number],
    provider: DictionaryProviderInfo | undefined,
    dragHandle: HTMLElement,
  ) {
    const row = this.document.createElement("div");
    row.className = cn(
      "bg-background grid gap-3 p-4 md:grid-cols-[auto_minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-center",
    );

    const handleCell = this.document.createElement("div");
    handleCell.className = cn("flex items-center justify-start md:justify-center");
    handleCell.append(dragHandle);

    const providerId = config.provider;
    const providerField = this.renderStaticField("Provider", provider?.name ?? providerId);
    const languagesField = this.renderStaticField(
      "Languages",
      provider?.supportedLanguages.map((code) => this.getLanguageLabel(code)).join(", ") ||
        "Unsupported",
    );

    const actions = this.document.createElement("div");
    actions.className = cn("flex flex-wrap gap-2 md:justify-end");

    const removeButton = createButton({
      doc: this.document,
      title: `Remove ${provider?.name ?? providerId}`,
      variant: "ghost",
      className: "text-destructive w-full sm:w-auto",
    });
    removeButton.append(this.document.createTextNode("Remove"));
    removeButton.addEventListener("click", () => {
      void this.configService.removeProvider(providerId).catch((error) => {
        this.showConfigError(error);
      });
    });

    actions.append(removeButton);
    row.append(handleCell, providerField, languagesField, actions);
    return row;
  }

  private renderStaticField(label: string, value: string) {
    const field = this.document.createElement("div");
    field.className = cn("space-y-1");

    const labelElement = this.document.createElement("p");
    labelElement.className = cn("text-muted-foreground text-xs font-medium uppercase md:hidden");
    labelElement.textContent = label;

    const valueElement = this.document.createElement("div");
    valueElement.className = cn("text-foreground min-h-9 px-1 py-2 text-sm font-medium");
    valueElement.textContent = value;

    field.append(labelElement, valueElement);
    return field;
  }

  private registerListeners() {
    this.addButton.addEventListener("click", () => {
      void this.createProvider().catch((error) => {
        this.showConfigError(error);
      });
    });
  }

  private createSelect() {
    return createSelect({ doc: this.document });
  }

  private async createProvider() {
    const providerId = this.addProviderSelect.value;
    if (!providerId) return;

    const provider = this.providers.find((item) => item.id === providerId);
    if (!provider) return;

    await this.configService.createProvider({
      provider: provider.id,
    });
  }

  private getLanguageLabel(code: string) {
    return this.languageDisplayNames.of(code) ?? code.toUpperCase();
  }

  private showConfigError(error: unknown) {
    console.error("Failed to save dictionary settings:", error);
  }
}
