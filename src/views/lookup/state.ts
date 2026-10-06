import type { WordEntry, WordLookupResult, WordLookupSource, WordLookupTask } from "@common/types";

export const TEXT_SOURCE_ID = "onedict:text";

export type WordLookupState = WordLookupSource & {
  result: { status: "loading" } | WordLookupResult;
};

interface LookupState {
  status: "loading" | "ready";
  results: WordLookupState[];
  selectedProviderId: string;
  textSelected: boolean;
  selectionWasManual: boolean;
  contextDrafts: Record<string, string>;
}

type LookupAction =
  | { type: "tasks"; tasks: WordLookupTask[] }
  | { type: "result"; providerId: string; result: WordLookupResult }
  | { type: "select"; id: string }
  | { type: "context"; providerId: string; value: string };

export const initialLookupState: LookupState = {
  status: "loading",
  results: [],
  selectedProviderId: "",
  textSelected: false,
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
      selectedProviderId: action.id === TEXT_SOURCE_ID ? state.selectedProviderId : action.id,
      textSelected: action.id === TEXT_SOURCE_ID,
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
      textSelected: false,
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

export function hasVisibleContent(entry: WordEntry) {
  return (
    entry.definitions.length > 0 ||
    entry.pronunciations.length > 0 ||
    (entry.metadata.tags?.length ?? 0) > 0 ||
    (entry.metadata.frequency ?? 0) > 0
  );
}
