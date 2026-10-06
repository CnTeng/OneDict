import type { IConfigStore } from "@common/types";
import type * as z from "zod";
import type { StorageAdapter } from "./storage";

export function createConfigStore<S extends z.ZodType<Record<string, unknown>>>(
  key: string,
  schema: S,
  adapter: StorageAdapter,
) {
  let pending = Promise.resolve();

  return {
    get: () => pending.then(async () => schema.parse(await adapter.get(key))),

    set(value: z.output<S>) {
      const result = pending.then(() => adapter.set(key, schema.parse(value)));
      pending = result.then(
        () => undefined,
        () => undefined,
      );
      return result;
    },

    onDidChange(listener: (config: z.output<S>) => void) {
      return adapter.subscribe(key, (value) => listener(schema.parse(value)));
    },
  } satisfies IConfigStore<z.output<S>>;
}
