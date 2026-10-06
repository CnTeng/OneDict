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
    <SettingsLayout
      title="About"
      description="OneDict brings dictionary lookup, AI explanations, and Anki cards to your reading."
    >
      <div class="border-border divide-border divide-y rounded-md border text-sm">
        <SettingsRow label="Version">{pkg.version}</SettingsRow>
        <SettingsRow label="Author">{pkg.author}</SettingsRow>
        {[
          { label: "Project", text: "GitHub", url: projectUrl },
          { label: "Feedback", text: "Report an issue", url: `${projectUrl}/issues` },
          { label: "License", text: "MIT", url: `${projectUrl}/blob/main/LICENSE` },
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
