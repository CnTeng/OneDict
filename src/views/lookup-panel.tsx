import { errorMessage } from "@common/error";
import type {
  Context,
  DictionaryEntry as DictionaryEntryData,
  DictionaryLookupResult,
  DictionaryLookupSource,
  DictionaryLookupTask,
  IAnkiService,
  IAudioService,
} from "@common/types";
import { HtmlAudioService } from "@services/audio";
import { Editor } from "@views/components/editor";
import { LucideIcon } from "@views/components/icon";
import { Sidebar, type SidebarItem } from "@views/components/sidebar";
import { DictionaryEntry } from "@views/dictionary/entry";
import { cn } from "cn";
import type { IconNode } from "lucide";
import { LoaderCircle, SearchX, TriangleAlert } from "lucide";
import { useEffect, useMemo, useReducer } from "preact/hooks";

interface LookupRequest {
  word: string;
  context?: Context;
}

type DictionaryLookupState = DictionaryLookupSource & {
  result: { status: "loading" } | DictionaryLookupResult;
};
type PanelStatus = "loading" | "ready";

interface LookupState {
  status: PanelStatus;
  results: DictionaryLookupState[];
  selectedProviderId: string;
  selectionWasManual: boolean;
  contextDrafts: Record<string, string>;
}

type LookupAction =
  | { type: "tasks"; tasks: DictionaryLookupTask[] }
  | { type: "result"; providerId: string; result: DictionaryLookupResult }
  | { type: "select"; id: string }
  | { type: "context"; providerId: string; value: string };

const initialLookupState: LookupState = {
  status: "loading",
  results: [],
  selectedProviderId: "",
  selectionWasManual: false,
  contextDrafts: {},
};

function reduceLookup(state: LookupState, action: LookupAction): LookupState {
  if (action.type === "context") {
    return {
      ...state,
      contextDrafts: { ...state.contextDrafts, [action.providerId]: action.value },
    };
  }
  if (action.type === "select") {
    return { ...state, selectedProviderId: action.id, selectionWasManual: true };
  }
  if (action.type === "tasks") {
    return {
      status: "ready",
      results: action.tasks.map((task) => ({
        providerId: task.providerId,
        providerName: task.providerName,
        providerIconUrl: task.providerIconUrl,
        result: { status: "loading" },
      })),
      selectedProviderId: action.tasks[0]?.providerId ?? "",
      selectionWasManual: false,
      contextDrafts: {},
    };
  }

  const results = state.results.map((item) =>
    item.providerId === action.providerId ? { ...item, result: action.result } : item,
  );
  const selected = results.find(({ providerId }) => providerId === state.selectedProviderId);
  const entry = action.result.status === "found" ? action.result.entry : null;
  const selectedEntry = selected?.result.status === "found" ? selected.result.entry : null;
  const shouldSelectResult =
    !state.selectionWasManual &&
    entry &&
    hasVisibleContent(entry) &&
    (!selectedEntry || !hasVisibleContent(selectedEntry));

  return {
    ...state,
    results,
    selectedProviderId: shouldSelectResult ? action.providerId : state.selectedProviderId,
  };
}

export interface LookupPanelProps {
  ownerDocument: Document;
  tasks?: DictionaryLookupTask[];
  request?: LookupRequest;
  ankiService?: IAnkiService;
  audioService?: IAudioService;
}

interface LookupPanelViewProps {
  status: PanelStatus;
  request?: LookupRequest;
  results: readonly DictionaryLookupState[];
  selectedProviderId: string;
  contextDrafts: Readonly<Record<string, string>>;
  ankiService?: IAnkiService;
  audioService: IAudioService;
  onSelect: (id: string) => void;
  onContextChange: (providerId: string, value: string) => void;
}

export function LookupPanel({
  ownerDocument,
  tasks,
  request,
  ankiService,
  audioService,
}: LookupPanelProps) {
  const [state, dispatch] = useReducer(reduceLookup, initialLookupState);
  const resolvedAudioService = useMemo(
    () => audioService ?? new HtmlAudioService(ownerDocument),
    [audioService, ownerDocument],
  );

  useEffect(() => {
    if (!tasks) return;
    let active = true;

    dispatch({ type: "tasks", tasks });
    tasks.forEach((task) => {
      void task.result.then((result) => {
        if (active) dispatch({ type: "result", providerId: task.providerId, result });
      });
    });

    return () => {
      active = false;
    };
  }, [tasks]);

  return (
    <LookupPanelView
      status={state.status}
      request={request}
      results={state.results}
      selectedProviderId={state.selectedProviderId}
      contextDrafts={state.contextDrafts}
      ankiService={ankiService}
      audioService={resolvedAudioService}
      onSelect={(id) => dispatch({ type: "select", id })}
      onContextChange={(providerId, value) => dispatch({ type: "context", providerId, value })}
    />
  );
}

function LookupPanelView({
  status,
  request,
  results,
  selectedProviderId,
  contextDrafts,
  ankiService,
  audioService,
  onSelect,
  onContextChange,
}: LookupPanelViewProps) {
  if (status === "loading")
    return <StatusMessage message="Looking up..." icon={LoaderCircle} spin />;
  if (results.length === 0) {
    return (
      <StatusMessage message="No dictionaries are available for this language." icon={SearchX} />
    );
  }

  const selected =
    results.find(({ providerId }) => providerId === selectedProviderId) ?? results[0];

  return (
    <div class="flex min-h-0 flex-1 flex-col">
      <div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_3rem] overflow-hidden">
        <main class="flex min-h-0 min-w-0 flex-col">
          {request && (
            <header class="border-border/80 bg-background/95 flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
              <h2 class="text-foreground min-w-0 truncate text-[1.1rem] leading-tight font-semibold tracking-tight">
                {request.word}
              </h2>
              <span class="text-muted-foreground min-w-0 truncate text-xs font-medium">
                {selected?.providerName ?? ""}
              </span>
            </header>
          )}
          <SelectedResult
            key={selected?.providerId}
            result={selected}
            ankiService={ankiService}
            audioService={audioService}
            context={selected && contextDrafts[selected.providerId]}
            onContextChange={onContextChange}
          />
        </main>
        <Sidebar
          ariaLabel="Dictionary results"
          items={results.map(createSidebarItem)}
          selectedId={selectedProviderId}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}

function SelectedResult({
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
    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div class="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <DictionaryEntry
          entry={entry}
          context={context ?? entry.context}
          ankiService={ankiService}
          audioService={audioService}
        />
      </div>
      <div class="border-border/80 bg-muted/80 shrink-0 border-t">
        <Editor
          initialValue={context ?? entry.context ?? ""}
          className="h-[20%] min-h-24"
          placeholder="Context / Note (Markdown supported)..."
          onChanged={(value) => onContextChange(result.providerId, value)}
        />
      </div>
    </div>
  );
}

function StatusMessage({
  message,
  icon,
  error = false,
  spin = false,
}: {
  message: string;
  icon: IconNode;
  error?: boolean;
  spin?: boolean;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      class="text-foreground/80 flex min-w-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center"
    >
      <LucideIcon iconNode={icon} className={spin ? "animate-spin" : undefined} />
      <p class={cn("text-sm", error && "text-destructive")}>{message}</p>
    </div>
  );
}

function createSidebarItem(result: DictionaryLookupState): SidebarItem {
  const item = {
    id: result.providerId,
    label: result.providerName,
    iconUrl: result.providerIconUrl,
  };
  if (result.result.status === "loading") {
    return { ...item, state: "pending", statusLabel: "Looking up" };
  }
  if (result.result.status === "failed") {
    return { ...item, state: "error", statusLabel: "Error" };
  }
  if (result.result.status === "found" && hasVisibleContent(result.result.entry)) {
    return { ...item, state: "ready", statusLabel: "Result" };
  }
  return { ...item, state: "idle", statusLabel: "No result" };
}

function hasVisibleContent(entry: DictionaryEntryData) {
  return (
    entry.definitions.length > 0 ||
    entry.pronunciations.length > 0 ||
    (entry.metadata.tags?.length ?? 0) > 0 ||
    (entry.metadata.frequency ?? 0) > 0
  );
}
