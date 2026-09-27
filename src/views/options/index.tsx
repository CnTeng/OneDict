import type { IAnkiService, IConfigService } from "@common/types";
import { AnkiSettings } from "./anki";
import { OptionsFooter } from "./footer";

export interface OptionsPageProps {
  ownerDocument: Document;
  configService: IConfigService;
  ankiService: IAnkiService;
}

export function OptionsPage({ ownerDocument, configService, ankiService }: OptionsPageProps) {
  return (
    <div class="border-border bg-background text-foreground w-full overflow-hidden rounded-lg border shadow-xs">
      <div class="space-y-10 px-4 py-6 sm:px-6">
        <AnkiSettings
          ownerDocument={ownerDocument}
          configService={configService.anki}
          ankiService={ankiService}
        />
      </div>
      <OptionsFooter ownerDocument={ownerDocument} configService={configService} />
    </div>
  );
}
