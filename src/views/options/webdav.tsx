import { t } from "@common/i18n";
import type { ConfigBackup, IConfigService } from "@common/types";
import { webdavConfigSchema } from "@common/types/config";
import { WebdavBackup } from "@services/config/webdav";
import { Button } from "@views/components/button";
import { Dialog } from "@views/components/dialog";
import { Input } from "@views/components/input";
import { Download, Upload } from "lucide-preact";
import type { ComponentProps } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useSettingsDraft } from "./draft";
import { SettingsNotice } from "./notice";
import { SettingsPage } from "./page";
import { SettingsRow } from "./row";

interface WebdavSettingsProps {
  configService: IConfigService;
  onDirtyChange: (dirty: boolean) => void;
}

export function WebdavSettings({ configService, onDirtyChange }: WebdavSettingsProps) {
  const draft = useSettingsDraft(configService.webdav, webdavConfigSchema, onDirtyChange);
  const { config, busy, change, cancel, runAction } = draft;
  const [settings, setSettings] = useState<ConfigBackup>();

  useEffect(() => {
    cancel("test");
    cancel("import");
    cancel("export");
    setSettings(undefined);
  }, [config.url, config.username, config.password, cancel]);

  return (
    <>
      <SettingsPage
        title="WebDAV"
        description={t("webdav.description")}
        draft={draft}
        onTest={(next, signal) => new WebdavBackup(next).test(signal)}
        footerActions={
          <>
            <Button
              size="icon"
              label={t("webdav.export")}
              loading={busy === "export"}
              disabled={Boolean(busy) || !config.url}
              onClick={() =>
                void runAction(
                  "export",
                  (signal) => configService.write(new WebdavBackup(config), signal),
                  {
                    pending: t("webdav.exporting"),
                    success: t("webdav.exported"),
                    onSuccess: () => setSettings(undefined),
                  },
                )
              }
            >
              <Upload class="size-4" />
            </Button>
            <Button
              size="icon"
              label={t("webdav.import")}
              loading={busy === "import"}
              disabled={Boolean(busy) || !config.url}
              onClick={() =>
                void runAction(
                  "import",
                  (signal) => configService.read(new WebdavBackup(config), signal),
                  {
                    pending: t("webdav.reading"),
                    success: t("webdav.ready"),
                    onSuccess: setSettings,
                  },
                )
              }
            >
              <Download class="size-4" />
            </Button>
          </>
        }
      >
        <SettingsRow label={t("webdav.url")} htmlFor="webdav-url" description={t("webdav.urlHint")}>
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
      </SettingsPage>
      {settings && (
        <ConfigImportDialog
          settings={settings}
          busy={Boolean(busy)}
          status={draft.status?.level === "error" ? draft.status : undefined}
          onClose={() => setSettings(undefined)}
          onImport={() =>
            runAction("import", () => configService.restoreBackup(settings), {
              pending: t("webdav.importing"),
              success: t("webdav.saved"),
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

function ConfigImportDialog({
  settings,
  busy,
  status,
  onClose,
  onImport,
}: ConfigImportDialogProps) {
  return (
    <Dialog
      open
      title={t("webdav.import")}
      description={t("webdav.ready")}
      onCancel={(event) => {
        if (busy) event.preventDefault();
      }}
      onClose={onClose}
      actions={
        <>
          <Button autoFocus disabled={busy} onClick={onClose}>
            {t("webdav.cancel")}
          </Button>
          <Button variant="success" loading={busy} onClick={() => void onImport()}>
            {t("webdav.confirmImport")}
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
              {t(settings.ai.apiKey ? "webdav.keyIncluded" : "webdav.noKey")}
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
