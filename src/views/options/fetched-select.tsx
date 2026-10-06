import { Button } from "@views/components/button";
import { Select } from "@views/components/select";
import { RefreshCw } from "lucide-preact";

interface FetchedSelectProps {
  id: string;
  value: string;
  options: readonly string[];
  loading: boolean;
  placeholder: string;
  fetchLabel: string;
  emptyLabel?: string;
  onChange: (value: string) => void;
  onFetch: () => void;
}

export function FetchedSelect({
  id,
  value,
  options,
  loading,
  placeholder,
  fetchLabel,
  emptyLabel,
  onChange,
  onFetch,
}: FetchedSelectProps) {
  return (
    <div class="flex flex-wrap gap-2">
      <Select
        id={id}
        class="min-w-0 flex-1"
        value={value}
        disabled={loading || !options.length}
        onChange={(event) => onChange(event.currentTarget.value)}
      >
        <option value="" selected={!value} disabled={!emptyLabel || !options.length}>
          {options.length ? (emptyLabel ?? "Select an option") : placeholder}
        </option>
        {value && !options.includes(value) && <option value={value}>{value} (current)</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      <Button
        size="icon"
        title={fetchLabel}
        aria-label={fetchLabel}
        loading={loading}
        onClick={onFetch}
      >
        <RefreshCw class="size-4" />
      </Button>
    </div>
  );
}
