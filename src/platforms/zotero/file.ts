import { t } from "@common/i18n";
import type { IFileService } from "@common/types";

interface FilePickerInstance {
  modeOpen: number;
  modeSave: number;
  returnCancel: number;
  file: string;
  defaultString: string;
  defaultExtension: string;
  init(window: Window, title: string, mode: number): void;
  appendFilter(title: string, pattern: string): void;
  show(): Promise<number>;
}

export class ZoteroFileService implements IFileService {
  async read(extension: string, signal?: AbortSignal): Promise<string> {
    const content = await Zotero.File.getContentsAsync(
      await this.pick("read", extension, signal),
      "utf-8",
    );
    signal?.throwIfAborted();
    if (typeof content !== "string") throw new Error(t("file.unreadable"));
    return content;
  }

  write(filename: string, content: string, signal?: AbortSignal): Promise<void> {
    return this.pick(
      "write",
      filename.includes(".") ? (filename.split(".").pop() ?? "") : "",
      signal,
      filename,
    ).then((path) => Zotero.File.putContentsAsync(path, content));
  }

  private async pick(
    mode: "read" | "write",
    extension: string,
    signal?: AbortSignal,
    filename?: string,
  ): Promise<string> {
    signal?.throwIfAborted();
    const { FilePicker } = ChromeUtils.importESModule(
      "chrome://zotero/content/modules/filePicker.mjs",
    ) as {
      FilePicker: new () => FilePickerInstance;
    };
    const picker = new FilePicker();
    picker.init(
      Zotero.getMainWindow(),
      t(mode === "read" ? "file.open" : "file.save"),
      mode === "read" ? picker.modeOpen : picker.modeSave,
    );
    if (extension) {
      picker.defaultExtension = extension;
      picker.appendFilter(extension.toUpperCase(), `*.${extension}`);
    }
    if (filename) picker.defaultString = filename;
    const result = await picker.show();
    signal?.throwIfAborted();
    if (result === picker.returnCancel) throw new Error(t("file.canceled"));
    return picker.file;
  }
}
