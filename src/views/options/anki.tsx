import { t } from "@common/i18n";
import type { IAnkiConfigService, IAnkiService } from "@common/types";
import { ankiConfigSchema } from "@common/types/config";
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
      pending: t("anki.connecting"),
      success: t("anki.connected"),
      onSuccess: setDeckOptions,
    });

  const syncTemplate = () =>
    runAction("template", (signal) => ankiService.syncTemplate(config, signal), {
      pending: t("anki.updatingTemplates"),
      success: t("anki.templatesUpdated"),
    });

  return (
    <SettingsPage
      title="Anki"
      description={t("anki.description")}
      draft={draft}
      onTest={async (next, signal) => {
        const decks = await ankiService.getDecks(next, signal);
        if (!signal.aborted) setDeckOptions(decks);
      }}
      footerActions={
        <Button
          title={t("anki.setupHint")}
          aria-label={t("anki.setupTemplate")}
          loading={busy === "template"}
          disabled={Boolean(busy)}
          onClick={() => void syncTemplate()}
        >
          {t("anki.setupTemplate")}
        </Button>
      }
    >
      <SettingsRow label={t("anki.connectUrl")} htmlFor="anki-url">
        <Input
          id="anki-url"
          value={config.connectUrl}
          placeholder={ankiConfigSchema.parse(undefined).connectUrl}
          onInput={(event) => change({ connectUrl: event.currentTarget.value })}
        />
      </SettingsRow>
      <SettingsRow label={t("anki.deck")} htmlFor="anki-deck" description={t("anki.deckHint")}>
        <FetchedSelect
          id="anki-deck"
          value={config.deck}
          options={deckOptions}
          loading={busy === "fetch"}
          placeholder={t("anki.fetchFirst")}
          fetchLabel={t("anki.fetchDecks")}
          emptyLabel={t("anki.noDeck")}
          onChange={(deck) => change({ deck })}
          onFetch={() => void refreshDecks()}
        />
      </SettingsRow>
    </SettingsPage>
  );
}
