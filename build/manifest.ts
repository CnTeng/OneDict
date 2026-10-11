import { globSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import type { Plugin } from "vite";

export function manifestPlugin({ manifest }: { manifest: unknown }): Plugin {
  return {
    name: "vite-plugin-extension-manifest",
    apply: "build",
    applyToEnvironment: (environment) => environment.name === "client",

    async generateBundle() {
      const localeDir = resolve(this.environment.config.root, "common/locales");
      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: JSON.stringify(manifest, null, 2),
      });

      await Promise.all(
        globSync("*.json", { cwd: localeDir }).map(async (file) => {
          const source = resolve(localeDir, file);
          this.addWatchFile(source);
          const { manifest: messages }: { manifest: Record<string, string> } = JSON.parse(
            await readFile(source, "utf8"),
          );
          this.emitFile({
            type: "asset",
            fileName: `_locales/${basename(file, ".json").replaceAll("-", "_")}/messages.json`,
            source: JSON.stringify(
              Object.fromEntries(
                Object.entries(messages).map(([key, message]) => [key, { message }]),
              ),
              null,
              2,
            ),
          });
        }),
      );
    },
  };
}
