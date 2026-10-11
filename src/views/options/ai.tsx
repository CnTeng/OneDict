import { t } from "@common/i18n";
import type { IAiConfigService, IAiService } from "@common/types";
import { aiConfigSchema } from "@common/types/config";
import { Input } from "@views/components/input";
import { Select } from "@views/components/select";
import { useEffect, useState } from "preact/hooks";
import { useSettingsDraft } from "./draft";
import { FetchedSelect } from "./fetched-select";
import { SettingsPage } from "./page";
import { SettingsRow } from "./row";

const explanationLanguages = [
  { value: "Chinese", label: "中文" },
  { value: "English", label: "English" },
  { value: "Japanese", label: "日本語" },
  { value: "Korean", label: "한국어" },
  { value: "French", label: "Français" },
  { value: "German", label: "Deutsch" },
  { value: "Spanish", label: "Español" },
];

interface AiSettingsProps {
  configService: IAiConfigService;
  aiService: IAiService;
  onDirtyChange?: (dirty: boolean) => void;
}

export function AiSettings({ configService, aiService, onDirtyChange }: AiSettingsProps) {
  const draft = useSettingsDraft(configService, aiConfigSchema, onDirtyChange);
  const { config, busy, change, cancel, runAction } = draft;
  const [models, setModels] = useState<string[]>([]);
  useEffect(() => {
    cancel("fetch");
    setModels([]);
  }, [config.baseUrl, config.apiKey, aiService, cancel]);

  const fetchModels = () =>
    runAction("fetch", (signal) => aiService.listModels(aiConfigSchema.parse(config), signal), {
      pending: t("ai.fetching"),
      success: (models) =>
        t("ai.modelsAvailable", {
          count: models.length,
        }),
      onSuccess: setModels,
    });

  return (
    <SettingsPage
      title="AI"
      description={t("ai.description")}
      draft={draft}
      onTest={(next, signal) => aiService.testConnection(next, signal)}
      allowEditingWhileFetching
    >
      <SettingsRow label={t("ai.baseUrl")} htmlFor="ai-url" description={t("ai.baseUrlHint")}>
        <Input
          id="ai-url"
          value={config.baseUrl}
          onInput={(event) => {
            cancel("fetch");
            change({ baseUrl: event.currentTarget.value });
          }}
        />
      </SettingsRow>
      <SettingsRow label={t("ai.apiKey")} htmlFor="ai-key" description={t("ai.apiKeyHint")}>
        <Input
          id="ai-key"
          type="password"
          value={config.apiKey}
          autocomplete="off"
          spellcheck={false}
          onInput={(event) => {
            cancel("fetch");
            change({ apiKey: event.currentTarget.value });
          }}
        />
      </SettingsRow>
      <SettingsRow label={t("ai.model")} htmlFor="ai-model" description={t("ai.modelHint")}>
        <FetchedSelect
          id="ai-model"
          value={config.model}
          options={models}
          loading={busy === "fetch"}
          placeholder={t("ai.fetchFirst")}
          fetchLabel={t("ai.fetchModels")}
          onChange={(model) => change({ model })}
          onFetch={() => void fetchModels()}
        />
      </SettingsRow>

      <SettingsRow label={t("ai.language")} htmlFor="ai-language">
        <Select
          id="ai-language"
          value={config.responseLanguage}
          onChange={(event) => change({ responseLanguage: event.currentTarget.value })}
        >
          {!explanationLanguages.some(({ value }) => value === config.responseLanguage) && (
            <option value={config.responseLanguage}>
              {t("common.current", { value: config.responseLanguage || "Chinese" })}
            </option>
          )}
          {explanationLanguages.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </SettingsRow>
    </SettingsPage>
  );
}
