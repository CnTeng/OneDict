import { t } from "@common/i18n";
import type {
  IAiService,
  IAnkiService,
  IAudioService,
  LookupRequest,
  WordLookupTask,
} from "@common/types";
import {
  Sidebar,
  type SidebarItem,
  type SidebarItemState,
  SidebarPanel,
} from "@views/components/sidebar";
import { LoaderCircle, SearchX, Sparkles } from "lucide-preact";
import { useEffect, useReducer, useState } from "preact/hooks";
import {
  TEXT_SOURCE_ID,
  type WordLookupState,
  hasVisibleContent,
  initialLookupState,
  reduceLookup,
} from "./state";
import { StatusMessage } from "./status";
import { TextLookup } from "./text";
import { WordLookup } from "./word";

interface LookupPanelProps {
  tasks?: WordLookupTask[];
  request?: LookupRequest;
  ankiService?: IAnkiService;
  audioService: IAudioService;
  aiService?: IAiService;
}

export function LookupPanel({
  tasks,
  request,
  ankiService,
  audioService,
  aiService,
}: LookupPanelProps) {
  const [state, dispatch] = useReducer(reduceLookup, initialLookupState);
  const [textState, setTextState] = useState<SidebarItemState>("idle");

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

  const { status, results, selectedProviderId, textSelected, contextDrafts } = state;
  const onContextChange = (providerId: string, value: string) =>
    dispatch({ type: "context", providerId, value });
  if (status === "loading")
    return <StatusMessage message={t("lookup.loading")} icon={LoaderCircle} spin />;
  if (results.length === 0 && !aiService) {
    return <StatusMessage message={t("lookup.noDictionaries")} icon={SearchX} />;
  }

  const selected =
    results.find(({ providerId }) => providerId === selectedProviderId) ?? results[0];

  const items: SidebarItem[] = [
    ...(request && aiService
      ? [
          {
            id: TEXT_SOURCE_ID,
            label: "AI",
            icon: Sparkles,
            iconClass: "fill-current text-yellow-500",
            state: textState,
            statusLabel:
              textState === "pending"
                ? t("ai.generating")
                : textState === "ready"
                  ? t("ai.ready")
                  : textState === "error"
                    ? t("ai.failed")
                    : t("ai.start"),
          },
        ]
      : []),
    ...results.map(createSidebarItem),
  ];

  return (
    <Sidebar
      ariaLabel={t("lookup.sources")}
      items={items}
      selectedId={textSelected ? TEXT_SOURCE_ID : (selected?.providerId ?? "")}
      onSelect={(id) => dispatch({ type: "select", id })}
    >
      {request && (
        <header class="border-border/80 bg-background/95 flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
          <h2 class="text-foreground min-w-0 truncate text-[1.1rem] leading-tight font-semibold tracking-tight">
            {request.text}
          </h2>
          <span class="text-muted-foreground min-w-0 truncate text-xs font-medium">
            {textSelected ? "AI" : (selected?.providerName ?? "")}
          </span>
        </header>
      )}
      {request && aiService && (
        <SidebarPanel itemId={TEXT_SOURCE_ID} class="overflow-hidden">
          <TextLookup
            request={request}
            aiService={aiService}
            active={textSelected}
            onStateChange={setTextState}
            ankiService={ankiService}
            contextDraft={contextDrafts[TEXT_SOURCE_ID] ?? request.context?.context ?? ""}
            onContextChange={(value) => onContextChange(TEXT_SOURCE_ID, value)}
          />
        </SidebarPanel>
      )}
      <SidebarPanel key={selected?.providerId} itemId={selected?.providerId} active={!textSelected}>
        {results.length === 0 && aiService ? (
          <StatusMessage message={t("lookup.aiHint")} icon={Sparkles} />
        ) : (
          <WordLookup
            result={selected}
            ankiService={ankiService}
            audioService={audioService}
            context={
              selected && (contextDrafts[selected.providerId] ?? request?.context?.context ?? "")
            }
            onContextChange={(value) => {
              if (selected) onContextChange(selected.providerId, value);
            }}
          />
        )}
      </SidebarPanel>
    </Sidebar>
  );
}

function createSidebarItem(result: WordLookupState): SidebarItem {
  const item = {
    id: result.providerId,
    label: result.providerName,
    iconUrl: result.providerIconUrl,
  };
  if (result.result.status === "loading") {
    return { ...item, state: "pending", statusLabel: t("lookup.pending") };
  }
  if (result.result.status === "failed") {
    return { ...item, state: "error", statusLabel: t("common.error") };
  }
  if (result.result.status === "found" && hasVisibleContent(result.result.entry)) {
    return { ...item, state: "ready", statusLabel: t("lookup.result") };
  }
  return { ...item, state: "idle", statusLabel: t("lookup.empty") };
}
