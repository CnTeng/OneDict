import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { type Target, createZoteroUpdate } from "@platforms/manifests";
import AdmZip from "adm-zip";
import { createBuilder } from "vite";
import pkg from "../package.json" with { type: "json" };

const resolve = (p: string) => path.resolve(import.meta.dirname, p);

const runBuild = async (target: Target) => {
  const start = Date.now();
  console.info(`🛠️ Building: ${target}...`);

  const builder = await createBuilder({ logLevel: "warn", mode: target });
  await builder.buildApp();

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.info(`✅ Done: ${target} built in ${duration}s`);
};

const runPackage = async (target: Target) => {
  const start = Date.now();

  const { name, version } = pkg;
  const ext = target === "chrome" ? "zip" : "xpi";
  const outputName = `${name}-${target}-v${version}.${ext}`;
  const outPath = resolve(`../dist/${outputName}`);

  const zip = new AdmZip();
  zip.addLocalFolder(resolve(`../dist/${target}`));
  const archive = zip.toBuffer();
  await fs.writeFile(outPath, archive);
  if (target === "zotero") {
    await fs.writeFile(
      resolve("../dist/update.json"),
      JSON.stringify(
        createZoteroUpdate(outputName, createHash("sha256").update(archive).digest("hex")),
        null,
        2,
      ) + "\n",
    );
  }

  const size = (archive.byteLength / 1024 / 1024).toFixed(2);
  const duration = ((Date.now() - start) / 1000).toFixed(2);

  console.info(`📦 Package: ${outputName} (${size} MB) in ${duration}s`);
};

const main = async () => {
  const target = process.argv[2] as Target;
  const shouldPackage = process.argv.includes("--package");

  try {
    await runBuild(target);
    if (shouldPackage) {
      await runPackage(target);
    }
  } catch (err) {
    console.error(`\n 🛑 FAILED  ${target}:`, err);
    process.exit(1);
  }
};

main();
