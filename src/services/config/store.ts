import type { IConfigStore, IStorageAdapter } from "@common/types";
import type * as z from "zod";

export class ConfigStore<T extends Record<string, unknown>> implements IConfigStore<T> {
  private pendingWrite = Promise.resolve();

  constructor(
    private readonly key: string,
    private readonly schema: z.ZodType<T>,
    private readonly adapter: IStorageAdapter,
  ) {}

  get(): Promise<T> {
    return this.pendingWrite
      .then(() => this.adapter.get(this.key))
      .then((value) => this.schema.parse(value));
  }

  set(value: T): Promise<void> {
    const write = this.pendingWrite.then(() =>
      this.adapter.set(this.key, this.schema.parse(value)),
    );
    // Keep the queue usable after a failed write; callers still receive the rejection.
    this.pendingWrite = write.catch(() => undefined);
    return write;
  }

  onDidChange(listener: (config: T) => void): () => void {
    return this.adapter.subscribe(this.key, (value) => listener(this.schema.parse(value)));
  }
}
