import { errorMessage } from "@common/error";
import { t } from "@common/i18n";
import type { IAnkiService, IAudioService } from "@common/types";
import { WordDefinition, WordMetadata, WordPronunciations } from "@views/components/word";
import { LoaderCircle, SearchX, TriangleAlert } from "lucide-preact";
import { AddButton } from "./add-button";
import { LookupLayout } from "./layout";
import { type WordLookupState, hasVisibleContent } from "./state";
import { StatusMessage } from "./status";

export function WordLookup({
  result,
  ankiService,
  audioService,
  context = "",
  onContextChange,
}: {
  result?: WordLookupState;
  ankiService?: IAnkiService;
  audioService: IAudioService;
  context?: string;
  onContextChange: (value: string) => void;
}) {
  if (!result) return <StatusMessage message={t("lookup.empty")} icon={SearchX} />;
  if (result.result.status === "loading") {
    return (
      <StatusMessage
        message={t("lookup.providerLoading", { provider: result.providerName })}
        icon={LoaderCircle}
        spin
      />
    );
  }
  if (result.result.status === "failed") {
    return <StatusMessage message={errorMessage(result.result.error)} icon={TriangleAlert} error />;
  }
  if (result.result.status === "empty") {
    return (
      <StatusMessage
        message={t("lookup.providerEmpty", { provider: result.providerName })}
        icon={SearchX}
      />
    );
  }
  if (!hasVisibleContent(result.result.entry)) {
    return (
      <StatusMessage
        message={t("lookup.providerUnusable", { provider: result.providerName })}
        icon={SearchX}
      />
    );
  }

  const { entry } = result.result;
  return (
    <LookupLayout
      label={t("lookup.providerResult", { provider: result.providerName })}
      context={context}
      onContextChange={onContextChange}
    >
      <div>
        <WordMetadata metadata={entry.metadata} className="mb-2.5" />
        <WordPronunciations
          pronunciations={entry.pronunciations}
          audioService={audioService}
          className="mb-2.5 gap-3.5"
        />
        {entry.definitions.length > 0 && (
          <div class="divide-border flex flex-col divide-y">
            {entry.definitions.map((definition, index) => (
              <WordDefinition
                key={index}
                definition={definition}
                index={index}
                actions={
                  ankiService && (
                    <AddButton
                      key={JSON.stringify([
                        entry.word,
                        entry.metadata.providerId,
                        definition,
                        context,
                      ])}
                      onAdd={() =>
                        ankiService.createWordNote({ ...entry, definitions: [definition] }, context)
                      }
                    />
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </LookupLayout>
  );
}
