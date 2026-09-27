import type { IConfigStore } from "@common/types";
import type * as z from "zod";
import { storage } from "./storage";

export function createConfigStore<S extends z.ZodType<Record<string, unknown>>>(
  key: string,
  schema: S,
) {
  type Config = z.output<S>;

  const parse = (value: unknown): Config => schema.parse(value);
  let pending = Promise.resolve();

  function enqueue<T>(operation: () => Promise<T>) {
    const result = pending.then(operation);
    pending = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  const store = {
    get: () => pending.then(async () => parse(await storage.get(key))),

    set: (value: Config) => enqueue(() => storage.set(key, parse(value))),

    update: (patch: Partial<Config>) =>
      enqueue(async () => {
        const next = parse({ ...parse(await storage.get(key)), ...patch });
        await storage.set(key, next);
        return next;
      }),

    reset: () =>
      enqueue(async () => {
        await storage.remove(key);
        return parse(undefined);
      }),

    onDidChange(listener: (config: Config) => void) {
      return storage.subscribe(key, ({ newValue }) => listener(parse(newValue)));
    },
  } satisfies IConfigStore<Config>;

  return store;
}
