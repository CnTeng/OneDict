import ky, { isNetworkError, isTimeoutError } from "ky";
import * as z from "zod";

type AnkiAction =
  | "addNote"
  | "createModel"
  | "deckNames"
  | "modelFieldAdd"
  | "modelFieldNames"
  | "modelFieldRemove"
  | "modelFieldReposition"
  | "modelNames"
  | "modelStyling"
  | "modelTemplateRename"
  | "modelTemplates"
  | "updateModelStyling"
  | "updateModelTemplates";

export type AnkiRequest = <S extends z.ZodType>(
  action: AnkiAction,
  resultSchema: S,
  params?: unknown,
) => Promise<z.output<S>>;

const ankiConnectResponseSchema = z.object({
  result: z.unknown(),
  error: z.string().nullable(),
});

export function createAnkiRequest(baseUrl: string, signal?: AbortSignal): AnkiRequest {
  return async <S extends z.ZodType>(
    action: AnkiAction,
    resultSchema: S,
    params?: unknown,
  ): Promise<z.output<S>> => {
    signal?.throwIfAborted();
    const data = await ky
      .post(baseUrl, { json: { action, version: 6, params }, signal })
      .json(ankiConnectResponseSchema)
      .catch((error: unknown) => {
        if (!isNetworkError(error) && !isTimeoutError(error)) throw error;
        throw new Error(
          "Could not connect to Anki. Please check if Anki is running and AnkiConnect is installed.",
          { cause: error },
        );
      });
    if (data.error !== null) throw new Error(data.error);
    return z.parse(resultSchema, data.result);
  };
}
