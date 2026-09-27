import { ankiConfigSchema } from "@common/config";
import { errorMessage } from "@common/error";
import type { AnkiConfig, IAnkiConfigService, IAnkiService } from "@common/types";
import { Button } from "@views/components/button";
import { LucideIcon } from "@views/components/icon";
import { Input } from "@views/components/input";
import { Select } from "@views/components/select";
import { RefreshCw } from "lucide";
import { useEffect, useRef, useState } from "preact/hooks";
import { SettingsNotice, useSettingsStatus } from "./notice";
import { SettingsRow } from "./row";

interface AnkiSettingsProps {
  ownerDocument: Document;
  configService: IAnkiConfigService;
  ankiService: IAnkiService;
}

export function AnkiSettings({ ownerDocument, configService, ankiService }: AnkiSettingsProps) {
  const [config, setConfig] = useState<AnkiConfig>(() => ankiConfigSchema.parse(undefined));
  const [connectUrlDraft, setConnectUrlDraft] = useState(config.connectUrl);
  const connectUrlRef = useRef<HTMLInputElement>(null);
  const [deckOptions, setDeckOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const { status, showStatus, clearStatus } = useSettingsStatus();
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const pendingUpdates = useRef(0);

  useEffect(() => {
    if (connectUrlRef.current !== ownerDocument.activeElement) {
      setConnectUrlDraft(config.connectUrl);
    }
  }, [config.connectUrl, ownerDocument]);

  useEffect(() => {
    let active = true;
    const unsubscribe = configService.onDidChange((nextConfig) => {
      if (active && pendingUpdates.current === 0) setConfig(nextConfig);
    });

    const decks = ankiService.getDecks().catch((error: unknown) => {
      if (active) showStatus("error", `Failed to load Anki decks: ${errorMessage(error)}`);
      return [];
    });

    void Promise.all([configService.get(), decks])
      .then(([nextConfig, decks]) => {
        if (!active) return;
        setConfig(nextConfig);
        setDeckOptions(decks);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(errorMessage(error));
        setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [ankiService, configService, showStatus]);

  const saveConfig = (patch: Partial<AnkiConfig>, setting: string) => {
    clearStatus();
    pendingUpdates.current += 1;
    setConfig((current) => ({ ...current, ...patch }));
    void configService.update(patch).then(
      (nextConfig) => {
        pendingUpdates.current -= 1;
        if (pendingUpdates.current === 0) setConfig(nextConfig);
      },
      (error: unknown) => {
        pendingUpdates.current -= 1;
        showStatus("error", `Failed to save ${setting}: ${errorMessage(error)}`);
        if (pendingUpdates.current === 0) {
          void configService
            .get()
            .then(setConfig)
            .catch((reason: unknown) =>
              showStatus("error", `Failed to reload options: ${errorMessage(reason)}`),
            );
        }
      },
    );
  };

  const refreshDecks = async () => {
    setRefreshing(true);
    showStatus("info", "Connecting to Anki...");
    await ankiService
      .getDecks()
      .then((decks) => {
        setDeckOptions(decks);
        showStatus("success", "Anki connection successful!");
      })
      .catch((error: unknown) => {
        showStatus("error", `Failed to refresh Anki decks: ${errorMessage(error)}`);
      })
      .finally(() => setRefreshing(false));
  };

  const syncTemplate = async () => {
    setSyncing(true);
    showStatus("info", "Processing Anki template...");
    await ankiService
      .syncTemplate()
      .then(() => showStatus("success", "Anki template is up to date!"))
      .catch((error: unknown) => {
        showStatus("error", `Failed to update Anki template: ${errorMessage(error)}`);
      })
      .finally(() => setSyncing(false));
  };

  if (loading) return <div class="text-muted-foreground text-sm">Loading Anki settings...</div>;
  if (loadError)
    return (
      <section class="space-y-4">
        <h2 class="text-foreground text-xl font-semibold">Anki</h2>
        <SettingsNotice
          status={{ level: "error", message: `Failed to load Anki settings: ${loadError}` }}
        />
      </section>
    );

  const availableDecks = Array.from(new Set([config.deck, ...deckOptions])).filter(Boolean);

  return (
    <section class="space-y-4">
      <div class="space-y-1">
        <h2 class="text-foreground text-xl font-semibold">Anki</h2>
        <p class="text-muted-foreground text-sm">
          Connect to Anki, choose where cards are saved, and keep the template up to date.
        </p>
      </div>
      <SettingsNotice status={status} />
      <div class="border-border divide-border divide-y rounded-md border">
        <SettingsRow label="AnkiConnect URL" htmlFor="anki-url">
          <div class="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              ref={connectUrlRef}
              id="anki-url"
              value={connectUrlDraft}
              placeholder={ankiConfigSchema.parse(undefined).connectUrl}
              onInput={(event) => setConnectUrlDraft(event.currentTarget.value)}
              onChange={(event) => {
                const connectUrl = event.currentTarget.value;
                if (connectUrl !== config.connectUrl) {
                  saveConfig({ connectUrl }, "AnkiConnect URL");
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
            />
            <Button
              title="Refresh Decks"
              class="w-full sm:w-auto"
              loading={refreshing}
              onClick={() => void refreshDecks()}
            >
              <LucideIcon iconNode={RefreshCw} customAttrs={{ width: 16, height: 16 }} />
              Refresh
            </Button>
          </div>
        </SettingsRow>
        <SettingsRow
          label="Deck"
          htmlFor="anki-deck"
          description="New cards are always added to this deck."
        >
          <Select
            id="anki-deck"
            value={config.deck}
            onChange={(event) => saveConfig({ deck: event.currentTarget.value }, "Anki deck")}
          >
            <option value="">No deck</option>
            {availableDecks.map((deck) => (
              <option key={deck} value={deck}>
                {deck}
              </option>
            ))}
          </Select>
        </SettingsRow>
        <SettingsRow
          label="Template"
          description="Generated cards always use the built-in Anki-Lex Modern note type."
        >
          <Button
            title="Create or upgrade the optimized Anki-Lex Modern note type in Anki"
            class="w-full text-left whitespace-normal sm:max-w-52 sm:justify-self-start"
            loading={syncing}
            onClick={() => void syncTemplate()}
          >
            Setup Template
          </Button>
        </SettingsRow>
      </div>
    </section>
  );
}
