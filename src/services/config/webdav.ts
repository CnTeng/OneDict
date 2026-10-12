import { t } from "@common/i18n";
import type { IConfigBackupAdapter, WebdavConfig } from "@common/types";
import { webdavConfigSchema } from "@common/types/config";
import type { WebDAVClient } from "webdav/web";

export class WebdavBackup implements IConfigBackupAdapter {
  constructor(private readonly config: WebdavConfig) {}

  test(signal?: AbortSignal): Promise<void> {
    return this.withWebdav(signal, (client, requestSignal) =>
      client
        .customRequest("/", {
          method: "PROPFIND",
          headers: { Depth: "0" },
          signal: requestSignal,
        })
        .then(() => undefined),
    );
  }

  read(signal?: AbortSignal): Promise<string> {
    return this.withWebdav(signal, (client, requestSignal) =>
      client.getFileContents("onedict/config.json", { format: "text", signal: requestSignal }),
    )
      .then((content) => {
        signal?.throwIfAborted();
        if (typeof content !== "string") throw new Error(t("config.invalidBackup"));
        return content;
      })
      .catch((error: unknown) => {
        if (
          error instanceof Error &&
          error.cause &&
          typeof error.cause === "object" &&
          "status" in error.cause &&
          error.cause.status === 404
        )
          throw new Error(t("webdav.fileNotFound"), { cause: error });
        throw error;
      });
  }

  write(content: string, signal?: AbortSignal): Promise<void> {
    return this.withWebdav(signal, async (client, requestSignal) => {
      await client.createDirectory("onedict", { signal: requestSignal }).catch((error: unknown) => {
        // WebDAV returns 405 when the collection already exists.
        if (error && typeof error === "object" && "status" in error && error.status === 405) return;
        throw error;
      });
      await client.putFileContents("onedict/config.json", content, {
        overwrite: true,
        contentLength: false,
        headers: { "Content-Type": "application/json" },
        signal: requestSignal,
      });
    });
  }

  private async withWebdav<T>(
    signal: AbortSignal | undefined,
    operation: (client: WebDAVClient, signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    const parsed = webdavConfigSchema.safeParse(this.config);
    if (!parsed.success || !parsed.data.url) throw new Error(t("webdav.invalidConnection"));
    signal?.throwIfAborted();
    const { url, username, password } = parsed.data;
    const controller = new AbortController();
    signal?.addEventListener("abort", () => controller.abort(signal.reason), {
      once: true,
      signal: controller.signal,
    });
    const timeout = setTimeout(() => controller.abort(new Error(t("webdav.timeout"))), 15_000);

    return import("webdav/web")
      .then(({ createClient }) => {
        controller.signal.throwIfAborted();
        return operation(createClient(url, { username, password }), controller.signal);
      })
      .catch((error: unknown) => {
        controller.signal.throwIfAborted();
        if (
          error &&
          typeof error === "object" &&
          "status" in error &&
          typeof error.status === "number"
        )
          throw new Error(t("webdav.httpError", { status: error.status }), { cause: error });
        throw new Error(t("webdav.connectionError"), { cause: error });
      })
      .finally(() => {
        clearTimeout(timeout);
        // Aborting also removes the listener attached to the caller's signal.
        controller.abort();
      });
  }
}
