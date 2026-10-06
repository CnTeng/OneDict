import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { type UserConfig, defineConfig, mergeConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { iifePlugin } from "./build/iife.ts";
import { manifestPlugin } from "./build/manifest.ts";
import { MANIFESTS, type Target } from "./src/platforms/manifests/index.ts";

const strategies: Record<"browser" | "zotero", UserConfig> = {
  browser: {
    environments: {
      client: {
        input: {
          frame: "platforms/browser/content/frame.html",
          options: "platforms/browser/options/options.html",
          popup: "platforms/browser/popup/popup.html",
        },
        build: {
          rolldownOptions: {
            output: {
              assetFileNames: "assets/[name].[ext]",
              chunkFileNames: "assets/chunks/[name].js",
              entryFileNames: (chunkInfo) =>
                chunkInfo.name === "frame"
                  ? "browser/content/frame.js"
                  : "browser/[name]/[name].js",
            },
          },
        },
      },
      content: {
        consumer: "client",
        build: {
          lib: {
            entry: "platforms/browser/content/content.tsx",
            formats: ["iife"],
            name: "OneDictContent",
            fileName: () => "browser/content/content.js",
          },
          emptyOutDir: false,
        },
      },
    },
  },

  zotero: {
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: "platforms/zotero/prefs/prefs.xhtml",
            dest: "prefs",
            rename: { stripBase: true },
          },
        ],
      }),
    ],
    build: {
      lib: {
        entry: "platforms/zotero/bootstrap.ts",
        formats: ["iife"],
        name: "ZoteroPlugin",
        fileName: () => "bootstrap.js",
        cssFileName: "prefs/prefs",
      },
      rolldownOptions: {
        output: {
          extend: true,
          footer: "var { install, uninstall, startup, shutdown } = ZoteroPlugin;",
        },
      },
    },
  },
};

export default defineConfig(({ mode }) => {
  if (!Object.hasOwn(MANIFESTS, mode)) {
    throw new Error(`Invalid build mode: ${mode}`);
  }
  const target = mode as Target;

  const strategy = target === "zotero" ? strategies.zotero : strategies.browser;

  const baseConfig: UserConfig = {
    root: "src",
    resolve: { tsconfigPaths: true },
    plugins: [
      iifePlugin(),
      tailwindcss(),
      manifestPlugin({ manifest: MANIFESTS[target] }),
      viteStaticCopy({ targets: [{ src: "assets/icons/*", dest: "." }] }),
    ],
    build: {
      target: "esnext",
      minify: false,
      outDir: resolve(import.meta.dirname, `dist/${target}`),
      emptyOutDir: true,
    },
  };

  return mergeConfig(baseConfig, strategy);
});
