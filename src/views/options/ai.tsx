import { aiConfigSchema } from "@common/config";
import type { IAiConfigService, IAiService } from "@common/types";
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
    runAction("fetch", (signal) => aiService.listModels(config, signal), {
      pending: "Fetching models...",
      success: (models) =>
        models.length + " models available. Select a model for text explanations.",
      onSuccess: setModels,
    });

  return (
    <SettingsPage
      title="AI"
      description="Connect an OpenAI-compatible provider."
      draft={draft}
      onTest={(next, signal) => aiService.testConnection(next, signal)}
      allowEditingWhileFetching
    >
      <SettingsRow
        label="API base URL"
        htmlFor="ai-url"
        description="Include the API version path, for example /v1."
      >
        <Input
          id="ai-url"
          value={config.baseUrl}
          onInput={(event) => {
            cancel("fetch");
            change({ baseUrl: event.currentTarget.value });
          }}
        />
      </SettingsRow>
      <SettingsRow
        label="API key"
        htmlFor="ai-key"
        description="Leave empty if your local provider does not require a key."
      >
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
      <SettingsRow
        label="Model"
        htmlFor="ai-model"
        description="Fetch available models, then select a text chat model."
      >
        <FetchedSelect
          id="ai-model"
          value={config.model}
          options={models}
          loading={busy === "fetch"}
          placeholder="Fetch models first"
          fetchLabel="Fetch Models"
          onChange={(model) => change({ model })}
          onFetch={() => void fetchModels()}
        />
      </SettingsRow>

      <SettingsRow label="Explanation language" htmlFor="ai-language">
        <Select
          id="ai-language"
          value={config.responseLanguage}
          onChange={(event) => change({ responseLanguage: event.currentTarget.value })}
        >
          {!explanationLanguages.some(({ value }) => value === config.responseLanguage) && (
            <option value={config.responseLanguage}>
              {config.responseLanguage || "Chinese"} (current)
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
