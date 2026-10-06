import type {
  AiConfig,
  IAiConfigService,
  IAiService,
  LookupRequest,
  TextEntry,
} from "@common/types";
import OpenAI from "openai";
import { explanationPrompt } from "./prompt";
import { REQUEST_TIMEOUT, readExplanation } from "./stream";

export class AiService implements IAiService {
  constructor(
    private readonly config: IAiConfigService,
    private readonly logger?: OpenAI["logger"],
  ) {}

  testConnection(config: AiConfig, signal?: AbortSignal): Promise<void> {
    return this.complete(config, 'Explain the word "hello" in one short sentence.', signal).then(
      () => undefined,
    );
  }

  async explain(
    { text, context }: LookupRequest,
    signal?: AbortSignal,
    onContent?: (content: string) => void,
  ): Promise<TextEntry> {
    if (!text.trim()) throw new Error("Select text before requesting an AI explanation.");
    return this.config.get().then((config) =>
      this.complete(
        config,
        JSON.stringify({
          text: text.trim(),
          context: context?.context.trim() ?? "",
          language: context?.lang,
        }),
        signal,
        onContent,
      ).then((explanation) => ({ text: text.trim(), explanation })),
    );
  }

  async listModels(config: AiConfig, signal?: AbortSignal): Promise<string[]> {
    signal?.throwIfAborted();
    return this.createClient(config)
      .models.list({ signal, timeout: 15_000 })
      .catch((error: unknown) => this.handleError(error, signal, true))
      .then(({ data }) => {
        const models = [...new Set(data.map(({ id }) => id.trim()).filter(Boolean))].sort();
        if (!models.length)
          throw new Error("No models were returned. Check your API key and model access.");
        return models;
      });
  }

  private createClient(config: AiConfig) {
    return new OpenAI({
      baseURL: config.baseUrl.replace(/\/+$/, ""),
      // The SDK requires a key; omit authentication for keyless local providers.
      apiKey: config.apiKey || "local",
      defaultHeaders: config.apiKey ? undefined : { Authorization: null },
      dangerouslyAllowBrowser: true,
      logger: this.logger,
      timeout: REQUEST_TIMEOUT,
      maxRetries: 0,
      fetchOptions: { redirect: "error", credentials: "omit" },
    });
  }

  private handleError(error: unknown, signal?: AbortSignal, models = false): never {
    if (signal?.aborted || error instanceof OpenAI.APIUserAbortError) throw error;
    if (error instanceof OpenAI.APIConnectionTimeoutError) {
      throw new Error("The AI request timed out. Please retry.", { cause: error });
    }
    if (error instanceof OpenAI.APIConnectionError) {
      throw new Error("Could not connect to the AI provider. Check the API URL and connection.", {
        cause: error,
      });
    }
    if (models && error instanceof OpenAI.APIError && [404, 405, 501].includes(error.status ?? 0)) {
      throw new Error(
        "This provider does not offer a model list at this URL. Check the API base URL or use a provider that supports model discovery.",
        { cause: error },
      );
    }
    throw error;
  }

  private async complete(
    config: AiConfig,
    input: string,
    signal?: AbortSignal,
    onContent?: (content: string) => void,
  ): Promise<string> {
    signal?.throwIfAborted();
    if (!config.model) throw new Error("Set an AI model in Settings first.");
    const stream = this.createClient(config).chat.completions.stream(
      {
        model: config.model,
        messages: [
          {
            role: "system",
            content: explanationPrompt(config.responseLanguage || "Chinese"),
          },
          { role: "user", content: input },
        ],
      },
      { signal },
    );
    return readExplanation(stream, signal, onContent).catch((error: unknown) =>
      this.handleError(error, signal),
    );
  }
}
