import { t } from "@common/i18n";
import type { IFileService } from "@common/types";

export class BrowserFileService implements IFileService {
  constructor(private readonly document: Document) {}

  read(extension: string, signal?: AbortSignal): Promise<string> {
    signal?.throwIfAborted();
    const input = this.document.createElement("input");
    input.type = "file";
    input.accept = extension ? `.${extension}` : "";
    input.hidden = true;
    this.document.body.append(input);

    let abort: () => void;
    return new Promise<File>((resolve, reject) => {
      abort = () => reject(signal?.reason);
      signal?.addEventListener("abort", abort, { once: true });
      input.addEventListener("cancel", () => reject(new Error(t("file.canceled"))), {
        once: true,
      });
      input.addEventListener(
        "change",
        () => {
          const file = input.files?.[0];
          if (file) resolve(file);
          else reject(new Error(t("file.canceled")));
        },
        { once: true },
      );
      input.click();
    })
      .then((file) => file.text())
      .then((content) => {
        signal?.throwIfAborted();
        return content;
      })
      .finally(() => {
        input.remove();
        signal?.removeEventListener("abort", abort);
      });
  }

  async write(filename: string, content: string, signal?: AbortSignal): Promise<void> {
    signal?.throwIfAborted();
    const view = this.document.defaultView;
    if (!view) throw new Error(t("file.unavailable"));
    const url = view.URL.createObjectURL(
      new view.Blob([content], { type: "application/octet-stream" }),
    );
    const link = this.document.createElement("a");
    link.href = url;
    link.download = filename;
    this.document.body.append(link);
    link.click();
    link.remove();
    view.setTimeout(() => view.URL.revokeObjectURL(url), 1000);
  }
}
