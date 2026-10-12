import { t } from "@common/i18n";
import type {
  ConfigBackup,
  IConfigBackupAdapter,
  IConfigService,
  IFileService,
} from "@common/types";
import { webdavConfigSchema } from "@common/types/config";
import { FileBackup, WebdavBackup } from "@services/config";
import { Button, Dialog, Input, Select } from "@views/components";
import { FileInput, FileOutput } from "lucide-preact";
import type { ComponentProps } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useSettingsDraft } from "./draft";
import { SettingsNotice } from "./notice";
import { SettingsPage } from "./page";
import { SettingsRow } from "./row";

export function BackupSettings({
  configService,
  fileService,
  onDirtyChange,
}: {
  configService: IConfigService;
  fileService: IFileService;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const draft = useSettingsDraft(configService.webdav, webdavConfigSchema, onDirtyChange);
  const { config, busy, change, cancel, runAction } = draft;
  const [destination, setDestination] = useState("local");
  const [settings, setSettings] = useState<ConfigBackup>();

  useEffect(() => {
    if (destination !== "webdav") return;
    cancel("test");
    cancel("import");
    cancel("export");
    setSettings(undefined);
  }, [destination, config.url, config.username, config.password, cancel]);

  const readBackup = (source: Pick<IConfigBackupAdapter, "read">) =>
    runAction("import", (signal) => configService.read(source, signal), {
      pending: t(destination === "local" ? "config.reading" : "webdav.reading"),
      success: t("config.ready"),
      onSuccess: setSettings,
    });

  return (
    <>
      <SettingsPage
        title={t("config.title")}
        description={t("config.description")}
        draft={draft}
        showConfigActions={destination === "webdav"}
        onTest={(next, signal) => new WebdavBackup(next).test(signal)}
        footerActions={
          <>
            <Button
              disabled={Boolean(busy) || (destination === "webdav" && !config.url)}
              loading={busy === "export"}
              onClick={() =>
                void runAction(
                  "export",
                  (signal) =>
                    configService.write(
                      destination === "local"
                        ? new FileBackup(fileService)
                        : new WebdavBackup(config),
                      signal,
                    ),
                  {
                    pending: t(destination === "local" ? "config.exporting" : "webdav.exporting"),
                    success: t(destination === "local" ? "config.exported" : "webdav.exported"),
                  },
                )
              }
            >
              <FileOutput class="size-4" />
              {t("config.export")}
            </Button>
            <Button
              disabled={Boolean(busy) || (destination === "webdav" && !config.url)}
              loading={busy === "import"}
              onClick={() =>
                void readBackup(
                  destination === "local" ? new FileBackup(fileService) : new WebdavBackup(config),
                )
              }
            >
              <FileInput class="size-4" />
              {t("config.import")}
            </Button>
          </>
        }
      >
        <SettingsRow
          label={t("config.destination")}
          htmlFor="backup-destination"
          description={t(destination === "local" ? "config.fileHint" : "webdav.description")}
        >
          <Select
            id="backup-destination"
            value={destination}
            onChange={(event) => {
              draft.clearStatus();
              setDestination(event.currentTarget.value);
            }}
          >
            <option value="local">{t("config.local")}</option>
            <option value="webdav">{t("webdav.title")}</option>
          </Select>
        </SettingsRow>
        {destination === "webdav" && (
          <>
            <SettingsRow
              label={t("webdav.url")}
              htmlFor="webdav-url"
              description={t("webdav.urlHint")}
            >
              <Input
                id="webdav-url"
                value={config.url}
                placeholder="https://example.com/dav/"
                onInput={(event) => change({ url: event.currentTarget.value })}
              />
            </SettingsRow>
            <SettingsRow label={t("webdav.username")} htmlFor="webdav-username">
              <Input
                id="webdav-username"
                value={config.username}
                autoComplete="off"
                onInput={(event) => change({ username: event.currentTarget.value })}
              />
            </SettingsRow>
            <SettingsRow label={t("webdav.password")} htmlFor="webdav-password">
              <Input
                id="webdav-password"
                type="password"
                value={config.password}
                autoComplete="off"
                onInput={(event) => change({ password: event.currentTarget.value })}
              />
            </SettingsRow>
          </>
        )}
      </SettingsPage>

      {settings && (
        <ConfigImportDialog
          settings={settings}
          busy={Boolean(busy)}
          status={draft.status?.level === "error" ? draft.status : undefined}
          onClose={() => setSettings(undefined)}
          onImport={() =>
            runAction("import", () => configService.restoreBackup(settings), {
              pending: t("config.restoring"),
              success: t("config.restored"),
              onSuccess: () => setSettings(undefined),
            })
          }
        />
      )}
    </>
  );
}

interface ConfigImportDialogProps {
  settings: ConfigBackup;
  busy: boolean;
  status?: ComponentProps<typeof SettingsNotice>["status"];
  onClose: () => void;
  onImport: () => Promise<void>;
}

export function ConfigImportDialog({
  settings,
  busy,
  status,
  onClose,
  onImport,
}: ConfigImportDialogProps) {
  return (
    <Dialog
      open
      title={t("config.import")}
      description={t("config.ready")}
      onCancel={(event) => {
        if (busy) event.preventDefault();
      }}
      onClose={onClose}
      actions={
        <>
          <Button autoFocus disabled={busy} onClick={onClose}>
            {t("config.cancel")}
          </Button>
          <Button variant="success" loading={busy} onClick={() => void onImport()}>
            {t("config.confirmImport")}
          </Button>
        </>
      }
    >
      <SettingsNotice status={status} />
      <fieldset class="divide-border border-border divide-y rounded-md border">
        <SettingsRow label={t("ai.title")}>
          <div class="space-y-1 text-sm break-all">
            <p>{settings.ai.baseUrl}</p>
            <p>
              {settings.ai.model || "—"} · {settings.ai.responseLanguage}
            </p>
            <p class="text-muted-foreground">
              {t(settings.ai.apiKey ? "config.keyIncluded" : "config.noKey")}
            </p>
          </div>
        </SettingsRow>
        <SettingsRow label={t("anki.title")}>
          <div class="space-y-1 text-sm break-all">
            <p>{settings.anki.connectUrl}</p>
            <p>{settings.anki.deck}</p>
          </div>
        </SettingsRow>
      </fieldset>
    </Dialog>
  );
}
