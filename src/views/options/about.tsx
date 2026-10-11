import { t } from "@common/i18n";
import { ExternalLink } from "lucide-preact";
import pkg from "../../../package.json" with { type: "json" };
import { SettingsLayout } from "./page";
import { SettingsRow } from "./row";

const projectUrl = "https://github.com/cnteng/onedict";

interface AboutSettingsProps {
  onOpenLink?: (url: string) => void;
}

export function AboutSettings({ onOpenLink }: AboutSettingsProps) {
  return (
    <SettingsLayout title={t("about.title")} description={t("about.description")}>
      <div class="divide-border border-border divide-y rounded-md border text-sm">
        <SettingsRow label={t("about.version")}>{pkg.version}</SettingsRow>
        <SettingsRow label={t("about.author")}>{pkg.author}</SettingsRow>
        {[
          { label: t("about.project"), text: "GitHub", url: projectUrl },
          { label: t("about.feedback"), text: t("about.reportIssue"), url: `${projectUrl}/issues` },
          { label: t("about.license"), text: "MIT", url: `${projectUrl}/blob/main/LICENSE` },
        ].map(({ label, text, url }) => (
          <SettingsRow key={label} label={label}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              class="text-foreground decoration-foreground/35 focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-sm underline underline-offset-4 outline-none hover:decoration-current focus-visible:ring-2"
              onClick={(event) => {
                if (!onOpenLink) return;
                event.preventDefault();
                onOpenLink(url);
              }}
            >
              {text}
              <ExternalLink class="size-3.5" aria-hidden="true" />
            </a>
          </SettingsRow>
        ))}
      </div>
    </SettingsLayout>
  );
}
