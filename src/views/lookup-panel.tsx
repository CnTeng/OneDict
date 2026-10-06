import type {
  Context,
  DictionaryLookupTask,
  IAiService,
  IAnkiService,
  IAudioService,
} from "@common/types";
import { AiExplanation } from "@views/ai-explanation";
import { Sidebar, type SidebarItem, type SidebarItemState } from "@views/components/sidebar";
import { StatusMessage } from "@views/components/status-message";
import { LoaderCircle, SearchX, Sparkles } from "lucide-preact";
import { useEffect, useReducer, useState } from "preact/hooks";
import { SelectedResult } from "./lookup-panel/result";
import {
  AI_SOURCE_ID,
  type DictionaryLookupState,
  type PanelStatus,
  hasVisibleContent,
  initialLookupState,
  reduceLookup,
} from "./lookup-panel/state";

interface LookupRequest {
  word: string;
  context?: Context;
}

export interface LookupPanelProps {
  tasks?: DictionaryLookupTask[];
  request?: LookupRequest;
  ankiService?: IAnkiService;
  audioService: IAudioService;
  aiService?: IAiService;
}

interface LookupPanelViewProps {
  status: PanelStatus;
  request?: LookupRequest;
  results: readonly DictionaryLookupState[];
  selectedProviderId: string;
  aiSelected: boolean;
  contextDrafts: Readonly<Record<string, string>>;
  ankiService?: IAnkiService;
  audioService: IAudioService;
  aiService?: IAiService;
  onSelect: (id: string) => void;
  onContextChange: (providerId: string, value: string) => void;
}

export function LookupPanel({
  tasks,
  request,
  ankiService,
  audioService,
  aiService,
}: LookupPanelProps) {
  const [state, dispatch] = useReducer(reduceLookup, initialLookupState);

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
      aiSelected={state.aiSelected}
      contextDrafts={state.contextDrafts}
      ankiService={ankiService}
      audioService={audioService}
      aiService={aiService}
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
  aiSelected,
  contextDrafts,
  ankiService,
  audioService,
  aiService,
  onSelect,
  onContextChange,
}: LookupPanelViewProps) {
  const [aiState, setAiState] = useState<SidebarItemState>("idle");
  if (status === "loading")
    return <StatusMessage message="Looking up..." icon={LoaderCircle} spin />;
  if (results.length === 0 && !aiService) {
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
                {aiSelected ? "AI" : (selected?.providerName ?? "")}
              </span>
            </header>
          )}
          {request && aiService && (
            <div hidden={!aiSelected} class="flex min-h-0 flex-1 flex-col overflow-hidden">
              <AiExplanation
                request={request}
                aiService={aiService}
                active={aiSelected}
                onStateChange={setAiState}
                ankiService={ankiService}
                contextDraft={contextDrafts[AI_SOURCE_ID] ?? request.context?.context ?? ""}
                onContextChange={(value) => onContextChange(AI_SOURCE_ID, value)}
              />
            </div>
          )}
          <div hidden={aiSelected} class="flex min-h-0 flex-1 flex-col">
            {results.length === 0 && aiService ? (
              <StatusMessage
                message="Select AI in the sidebar to explain the selected text."
                icon={Sparkles}
              />
            ) : (
              <SelectedResult
                key={selected?.providerId}
                result={selected}
                ankiService={ankiService}
                audioService={audioService}
                context={selected && contextDrafts[selected.providerId]}
                onContextChange={onContextChange}
              />
            )}
          </div>
        </main>
        <Sidebar
          ariaLabel="Lookup sources"
          items={[
            ...(request && aiService
              ? [
                  {
                    id: AI_SOURCE_ID,
                    label: "AI",
                    icon: Sparkles,
                    iconClass: "fill-current text-yellow-500",
                    state: aiState,
                    statusLabel:
                      aiState === "pending"
                        ? "Generating explanation"
                        : aiState === "ready"
                          ? "Explanation ready"
                          : aiState === "error"
                            ? "Generation failed"
                            : "Click to explain",
                  },
                ]
              : []),
            ...results.map(createSidebarItem),
          ]}
          selectedId={aiSelected ? AI_SOURCE_ID : selectedProviderId}
          onSelect={onSelect}
        />
      </div>
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
