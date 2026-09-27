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
  | "updateModelStyling"
  | "updateModelTemplates";

export type AnkiRequest = <S extends z.ZodType>(
  action: AnkiAction,
  resultSchema: S,
  params?: unknown,
) => Promise<z.output<S>>;

type AnkiConnectRequest = {
  action: AnkiAction;
  version: 6;
  params?: unknown;
};

const ankiConnectResponseSchema = z.object({
  result: z.unknown(),
  error: z.string().nullable(),
});

export function createAnkiRequest(baseUrl: string): AnkiRequest {
  return async <S extends z.ZodType>(
    action: AnkiAction,
    resultSchema: S,
    params?: unknown,
  ): Promise<z.output<S>> => {
    const result = await invokeAnkiConnect(baseUrl, createAnkiConnectRequest(action, params));
    return z.parse(resultSchema, result);
  };
}

function createAnkiConnectRequest(action: AnkiAction, params?: unknown): AnkiConnectRequest {
  return {
    action,
    version: 6,
    ...(params === undefined ? {} : { params }),
  };
}

async function invokeAnkiConnect(baseUrl: string, body: AnkiConnectRequest): Promise<unknown> {
  const data = await ky
    .post(baseUrl, { json: body })
    .json(ankiConnectResponseSchema)
    .catch((error: unknown) => {
      if (!isNetworkError(error) && !isTimeoutError(error)) throw error;
      throw new Error(
        "Could not connect to Anki. Please check if Anki is running and AnkiConnect is installed.",
        { cause: error },
      );
    });
  if (data.error !== null) throw new Error(data.error);
  return data.result;
}
