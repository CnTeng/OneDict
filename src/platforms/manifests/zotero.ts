import { author, manifestMetadata, version } from "./base.ts";

export const zoteroManifest = {
  ...manifestMetadata,
  version,
  author,
  homepage_url: "https://github.com/CnTeng/OneDict",
  icons: {
    "48": "assets/icons/icon48.png",
    "128": "assets/icons/icon128.png",
  },
  manifest_version: 2,
  applications: {
    zotero: {
      id: "onedict-zotero@onedict.com",
      strict_min_version: "7.0",
      strict_max_version: "10.0.*",
      update_url: "https://github.com/CnTeng/OneDict/releases/latest/download/update.json",
    },
  },
};

export function createZoteroUpdate(fileName: string, hash: string) {
  const { version, homepage_url, applications } = zoteroManifest;
  const { id, strict_min_version, strict_max_version } = applications.zotero;

  return {
    addons: {
      [id]: {
        updates: [
          {
            version,
            update_link: `${homepage_url}/releases/download/v${version}/${fileName}`,
            update_hash: `sha256:${hash}`,
            applications: { zotero: { strict_min_version, strict_max_version } },
          },
        ],
      },
    },
  };
}
