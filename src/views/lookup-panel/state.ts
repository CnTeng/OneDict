import type {
  DictionaryEntry,
  DictionaryLookupResult,
  DictionaryLookupSource,
  DictionaryLookupTask,
} from "@common/types";

export const AI_SOURCE_ID = "onedict:ai";

export type DictionaryLookupState = DictionaryLookupSource & {
  result: { status: "loading" } | DictionaryLookupResult;
};
export type PanelStatus = "loading" | "ready";

interface LookupState {
  status: PanelStatus;
  results: DictionaryLookupState[];
  selectedProviderId: string;
  aiSelected: boolean;
  selectionWasManual: boolean;
  contextDrafts: Record<string, string>;
}

type LookupAction =
  | { type: "tasks"; tasks: DictionaryLookupTask[] }
  | { type: "result"; providerId: string; result: DictionaryLookupResult }
  | { type: "select"; id: string }
  | { type: "context"; providerId: string; value: string };

export const initialLookupState: LookupState = {
  status: "loading",
  results: [],
  selectedProviderId: "",
  aiSelected: false,
  selectionWasManual: false,
  contextDrafts: {},
};

export function reduceLookup(state: LookupState, action: LookupAction): LookupState {
  if (action.type === "context") {
    return {
      ...state,
      contextDrafts: { ...state.contextDrafts, [action.providerId]: action.value },
    };
  }
  if (action.type === "select") {
    return {
      ...state,
      selectedProviderId: action.id === AI_SOURCE_ID ? state.selectedProviderId : action.id,
      aiSelected: action.id === AI_SOURCE_ID,
      selectionWasManual: true,
    };
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
      aiSelected: false,
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

export function hasVisibleContent(entry: DictionaryEntry) {
  return (
    entry.definitions.length > 0 ||
    entry.pronunciations.length > 0 ||
    (entry.metadata.tags?.length ?? 0) > 0 ||
    (entry.metadata.frequency ?? 0) > 0
  );
}
