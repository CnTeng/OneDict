import type { DictionaryLookupTask, IDictionaryService } from "@common/types";
import { IconButton } from "@views/components/button";
import { Input } from "@views/components/input";
import { Search, Settings } from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";

export interface SearchBarOptions {
  dictionaryService: IDictionaryService;
  onSubmit: (submission: SearchSubmission) => void;
  onOpenSettings: () => void;
}

export interface SearchSubmission {
  word: string;
  tasks: DictionaryLookupTask[];
}

export function SearchBar({ dictionaryService, onSubmit, onOpenSettings }: SearchBarOptions) {
  const localInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => localInputRef.current?.focus(), []);

  return (
    <div class="border-border bg-background w-full border-b px-3 py-2">
      <form
        class="border-border bg-muted focus-within:border-ring focus-within:ring-ring/20 grid w-full grid-cols-[32px_minmax(0,1fr)_32px] items-center rounded-full border shadow-sm transition-all focus-within:ring-2"
        onSubmit={(event) => {
          event.preventDefault();
          const word = localInputRef.current?.value.trim();
          if (!word) return;
          onSubmit({ word, tasks: dictionaryService.lookup(word) });
        }}
      >
        <span class="text-muted-foreground flex items-center justify-center">
          <Search size={16} />
        </span>
        <Input
          ref={localInputRef}
          appearance="bare"
          required
          placeholder="Search ..."
          autocomplete="off"
          class="px-2 py-1.5"
        />
        <IconButton
          type="button"
          title="Settings"
          class="hover:bg-background/70 rounded-full"
          onClick={onOpenSettings}
        >
          <Settings size={16} />
        </IconButton>
      </form>
    </div>
  );
}
