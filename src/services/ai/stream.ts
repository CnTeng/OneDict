import { t } from "@common/i18n";
import OpenAI from "openai";
import type { ChatCompletionStream } from "openai/lib/ChatCompletionStream";

export const REQUEST_TIMEOUT = 60_000;

export function readExplanation(
  stream: ChatCompletionStream,
  signal?: AbortSignal,
  onContent?: (content: string) => void,
): Promise<string> {
  // The SDK's fetch timeout ends at response headers; bound the full stream too.
  const timeout = setTimeout(
    () => stream.controller.abort(new OpenAI.APIConnectionTimeoutError()),
    REQUEST_TIMEOUT,
  );

  return stream
    .on("content.delta", ({ snapshot }) => {
      if (!signal?.aborted) onContent?.(snapshot);
    })
    .finalChatCompletion()
    .catch((error: unknown) => {
      // Recover the native abort reason instead of the SDK's generic abort error.
      signal?.throwIfAborted();
      stream.controller.signal.throwIfAborted();
      throw error;
    })
    .finally(() => clearTimeout(timeout))
    .then(({ choices: [choice] }) => {
      signal?.throwIfAborted();
      // Unstructured streams do not reject these finish reasons in the SDK.
      if (choice?.finish_reason === "length") throw new Error(t("errors.aiTruncated"));
      if (choice?.finish_reason === "content_filter") throw new Error(t("errors.aiFiltered"));
      const content = choice?.message?.content?.trim();
      if (!content) throw new Error(t("errors.aiEmpty"));
      return content;
    });
}
