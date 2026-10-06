import { errorMessage } from "@common/error";
import type { IAnkiService, IAudioService } from "@common/types";
import { StatusMessage } from "@views/components/status-message";
import { DictionaryEntry } from "@views/dictionary/entry";
import { LoaderCircle, SearchX, TriangleAlert } from "lucide-preact";
import { LookupLayout } from "./layout";
import { type DictionaryLookupState, hasVisibleContent } from "./state";

export function SelectedResult({
  result,
  ankiService,
  audioService,
  context,
  onContextChange,
}: {
  result?: DictionaryLookupState;
  ankiService?: IAnkiService;
  audioService: IAudioService;
  context?: string;
  onContextChange: (providerId: string, value: string) => void;
}) {
  if (!result) return <StatusMessage message="No result" icon={SearchX} />;
  if (result.result.status === "loading") {
    return (
      <StatusMessage message={`Looking up ${result.providerName}...`} icon={LoaderCircle} spin />
    );
  }
  if (result.result.status === "failed") {
    return <StatusMessage message={errorMessage(result.result.error)} icon={TriangleAlert} error />;
  }
  if (result.result.status === "empty") {
    return <StatusMessage message={`No result from ${result.providerName}.`} icon={SearchX} />;
  }
  if (!hasVisibleContent(result.result.entry)) {
    return (
      <StatusMessage message={`No usable result from ${result.providerName}.`} icon={SearchX} />
    );
  }

  const { entry } = result.result;
  return (
    <LookupLayout
      label={`${result.providerName} result`}
      context={context ?? entry.context ?? ""}
      onContextChange={(value) => onContextChange(result.providerId, value)}
    >
      <DictionaryEntry
        entry={entry}
        context={context ?? entry.context}
        ankiService={ankiService}
        audioService={audioService}
      />
    </LookupLayout>
  );
}
