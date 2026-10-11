import { t } from "@common/i18n";
import { IconButton } from "@views/components/button";
import { Input } from "@views/components/input";
import { Search, Settings } from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";

interface SearchBarProps {
  onSearch: (text: string) => void;
  onOpenSettings: () => void;
}

export function SearchBar({ onSearch, onOpenSettings }: SearchBarProps) {
  const localInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => localInputRef.current?.focus(), []);

  return (
    <div class="border-border bg-background w-full border-b px-3 py-2">
      <form
        class="border-border bg-muted focus-within:border-ring focus-within:ring-ring/20 grid w-full grid-cols-[32px_minmax(0,1fr)_32px] items-center rounded-full border shadow-sm transition-all focus-within:ring-2"
        onSubmit={(event) => {
          event.preventDefault();
          const text = localInputRef.current?.value.trim();
          if (!text) return;
          onSearch(text);
        }}
      >
        <span class="text-muted-foreground flex items-center justify-center">
          <Search size={16} />
        </span>
        <Input
          ref={localInputRef}
          appearance="bare"
          required
          placeholder={t("search.placeholder")}
          autocomplete="off"
          class="px-2 py-1.5"
        />
        <IconButton
          type="button"
          label={t("settings.title")}
          class="hover:bg-background/70 rounded-full"
          onClick={onOpenSettings}
        >
          <Settings size={16} />
        </IconButton>
      </form>
    </div>
  );
}
