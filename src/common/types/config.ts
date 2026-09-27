export type { AnkiConfig } from "../config";

export interface SelectOption {
  value: string;
  label: string;
}

export interface AnkiState {
  deckOptions: SelectOption[];
}
