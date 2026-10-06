import { ankiConfigSchema } from "@common/config";
import type { IAnkiConfigService, IAnkiService } from "@common/types";
import { Button } from "@views/components/button";
import { Input } from "@views/components/input";
import { useEffect, useState } from "preact/hooks";
import { useSettingsDraft } from "./draft";
import { FetchedSelect } from "./fetched-select";
import { SettingsPage } from "./page";
import { SettingsRow } from "./row";

interface AnkiSettingsProps {
  configService: IAnkiConfigService;
  ankiService: IAnkiService;
  onDirtyChange?: (dirty: boolean) => void;
}

export function AnkiSettings({ configService, ankiService, onDirtyChange }: AnkiSettingsProps) {
  const draft = useSettingsDraft(configService, ankiConfigSchema, onDirtyChange);
  const { config, busy, change, cancel, runAction } = draft;
  const [deckOptions, setDeckOptions] = useState<string[]>([]);
  useEffect(() => {
    cancel("fetch");
    setDeckOptions([]);
  }, [config.connectUrl, ankiService, cancel]);

  const refreshDecks = () =>
    runAction("fetch", (signal) => ankiService.getDecks(config, signal), {
      pending: "Connecting to Anki...",
      success: "Anki connection successful!",
      onSuccess: setDeckOptions,
    });

  const syncTemplate = () =>
    runAction("template", (signal) => ankiService.syncTemplate(config, signal), {
      pending: "Processing Anki templates...",
      success: "Dictionary and AI templates are up to date!",
    });

  return (
    <SettingsPage
      title="Anki"
      description="Connect to Anki and choose a deck."
      draft={draft}
      onTest={async (next, signal) => {
        const decks = await ankiService.getDecks(next, signal);
        if (!signal.aborted) setDeckOptions(decks);
      }}
      footerActions={
        <Button
          title="Create or upgrade the OneDict Word and OneDict Text note types in Anki"
          aria-label="Setup Template"
          loading={busy === "template"}
          disabled={Boolean(busy)}
          onClick={() => void syncTemplate()}
        >
          Setup Template
        </Button>
      }
    >
      <SettingsRow label="AnkiConnect URL" htmlFor="anki-url">
        <Input
          id="anki-url"
          value={config.connectUrl}
          placeholder={ankiConfigSchema.parse(undefined).connectUrl}
          onInput={(event) => change({ connectUrl: event.currentTarget.value })}
        />
      </SettingsRow>
      <SettingsRow
        label="Deck"
        htmlFor="anki-deck"
        description="New cards are always added to this deck."
      >
        <FetchedSelect
          id="anki-deck"
          value={config.deck}
          options={deckOptions}
          loading={busy === "fetch"}
          placeholder="Fetch decks first"
          fetchLabel="Fetch Decks"
          emptyLabel="No deck"
          onChange={(deck) => change({ deck })}
          onFetch={() => void refreshDecks()}
        />
      </SettingsRow>
    </SettingsPage>
  );
}
