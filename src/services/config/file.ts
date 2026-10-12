import type { IConfigBackupAdapter, IFileService } from "@common/types";

export class FileBackup implements Pick<IConfigBackupAdapter, "read" | "write"> {
  constructor(private readonly file: IFileService) {}

  read(signal?: AbortSignal): Promise<string> {
    return this.file.read("json", signal);
  }

  write(content: string, signal?: AbortSignal): Promise<void> {
    return this.file.write("onedict-config.json", content, signal);
  }
}
