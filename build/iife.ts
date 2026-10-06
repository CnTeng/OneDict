import { type Plugin, type ResolvedConfig, build } from "vite";

export function iifePlugin(): Plugin {
  let viteConfig: ResolvedConfig;

  return {
    name: "vite-plugin-iife",
    enforce: "pre",

    configResolved(config) {
      viteConfig = config;
    },

    async load(id) {
      if (!id.endsWith("&iife")) return null;

      const queryIndex = id.indexOf("?");
      const name = new URLSearchParams(id.slice(queryIndex)).get("name");
      if (!name) throw new Error(`IIFE import requires a global name: ${id}`);

      const result = await build({
        configFile: false,
        root: viteConfig.root,
        input: id.slice(0, queryIndex),
        plugins: [iifePlugin()],
        build: {
          lib: {
            formats: ["iife"],
            name,
          },
          write: false,
          minify: true,
        },
        resolve: {
          alias: viteConfig.resolve.alias,
          tsconfigPaths: viteConfig.resolve.tsconfigPaths,
        },
        logLevel: "silent",
      });

      const output = Array.isArray(result) ? result[0] : result;
      const chunk = "output" in output ? output.output[0] : null;
      if (!chunk || !("code" in chunk)) {
        throw new Error(`Failed to bundle IIFE: ${id}`);
      }

      return {
        code: `export default ${JSON.stringify(chunk.code)};`,
        map: null,
      };
    },
  };
}
