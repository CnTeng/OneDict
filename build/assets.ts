import { globSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, posix, resolve } from "node:path";
import type { Plugin } from "vite";

export function assetsPlugin(targets: Record<string, string>): Plugin {
  return {
    name: "vite-plugin-static-assets",
    apply: "build",
    applyToEnvironment: (environment) => environment.name === "client",

    async generateBundle() {
      const root = this.environment.config.root;
      await Promise.all(
        Object.entries(targets).flatMap(([pattern, destination]) => {
          const files = globSync(pattern, { cwd: root });
          if (!files.length) this.error(`No static assets match: ${pattern}`);

          return files.map(async (file) => {
            const source = resolve(root, file);
            this.addWatchFile(source);
            this.emitFile({
              type: "asset",
              fileName: posix.join(destination, basename(file)),
              source: await readFile(source),
            });
          });
        }),
      );
    },
  };
}
