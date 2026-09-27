import { cn } from "cn";

export type SidebarItemState = "pending" | "ready" | "idle" | "error";

export interface SidebarItem {
  id: string;
  label: string;
  iconUrl: string;
  state: SidebarItemState;
  statusLabel: string;
}

interface SidebarProps {
  items: readonly SidebarItem[];
  selectedId: string;
  ariaLabel: string;
  onSelect: (id: string) => void;
}

export function Sidebar({ items, selectedId, ariaLabel, onSelect }: SidebarProps) {
  return (
    <aside
      aria-label={ariaLabel}
      class="border-border/80 bg-muted/30 flex min-h-0 flex-col items-center overflow-x-hidden overflow-y-auto border-l px-1.5 py-2"
    >
      <div class="space-y-1">
        {items.map((item) => (
          <SidebarButton
            key={item.id}
            item={item}
            selected={item.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </aside>
  );
}

interface SidebarButtonProps {
  item: SidebarItem;
  selected: boolean;
  onSelect: (id: string) => void;
}

function SidebarButton({ item, selected, onSelect }: SidebarButtonProps) {
  const ready = item.state === "ready";
  const accessibleLabel = `${item.label}: ${item.statusLabel}`;

  return (
    <button
      type="button"
      title={accessibleLabel}
      class={cn(
        "group hover:bg-muted focus-visible:ring-ring relative flex size-9 items-center justify-center rounded-lg transition-[background-color,box-shadow,transform] outline-none focus-visible:ring-2",
        selected && "bg-background ring-border shadow-sm ring-1",
        item.state === "error" && "text-destructive",
        ready && "text-foreground",
      )}
      aria-pressed={selected}
      aria-label={accessibleLabel}
      onClick={() => onSelect(item.id)}
    >
      {selected && (
        <span class="bg-primary absolute top-1/2 -left-1.5 h-4 w-0.5 -translate-y-1/2 rounded-full" />
      )}
      <img
        alt=""
        class={cn(
          "size-5 rounded object-contain transition-transform group-hover:scale-105",
          !ready && "opacity-45 grayscale",
        )}
        src={item.iconUrl}
      />
      <span
        class={cn(
          "border-background absolute right-0.5 bottom-0.5 size-2 rounded-full border",
          item.state === "pending" && "bg-muted-foreground/60 animate-pulse",
          ready && "bg-success",
          item.state === "idle" && "bg-muted-foreground",
          item.state === "error" && "bg-destructive",
        )}
      />
    </button>
  );
}
