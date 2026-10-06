import { cn } from "cn";
import type { LucideIcon } from "lucide-preact";

export type SidebarItemState = "pending" | "ready" | "idle" | "error";

export type SidebarItem = {
  id: string;
  label: string;
  state: SidebarItemState;
  statusLabel: string;
} & (
  | { iconUrl: string; icon?: never; iconClass?: never }
  | { icon: LucideIcon; iconUrl?: never; iconClass?: string }
);

interface SidebarProps {
  items: readonly SidebarItem[];
  selectedId: string;
  ariaLabel: string;
  onSelect: (id: string) => void;
  side?: "left" | "right";
  showStatus?: boolean;
}

export function Sidebar({
  items,
  selectedId,
  ariaLabel,
  onSelect,
  side = "right",
  showStatus = true,
}: SidebarProps) {
  return (
    <aside
      aria-label={ariaLabel}
      class={cn(
        "border-border/80 bg-muted/30 flex min-h-0 shrink-0 flex-col items-center overflow-x-hidden overflow-y-auto px-1.5 py-2",
        side === "left" ? "border-r" : "border-l",
      )}
    >
      <div class="space-y-1">
        {items.map((item) => (
          <SidebarButton
            key={item.id}
            item={item}
            selected={item.id === selectedId}
            onSelect={onSelect}
            side={side}
            showStatus={showStatus}
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
  side: "left" | "right";
  showStatus: boolean;
}

function SidebarButton({ item, selected, onSelect, side, showStatus }: SidebarButtonProps) {
  const Icon = item.icon;
  const ready = item.state === "ready";
  const accessibleLabel = showStatus ? `${item.label}: ${item.statusLabel}` : item.label;

  return (
    <button
      type="button"
      title={accessibleLabel}
      class={cn(
        "group hover:bg-muted focus-visible:ring-ring relative flex size-9 appearance-none items-center justify-center rounded-lg border-0 p-0 transition-[background-color,box-shadow,transform] outline-none focus-visible:ring-2",
        selected ? "bg-background ring-border shadow-sm ring-1" : "bg-transparent shadow-none",
        item.state === "error" && "text-destructive",
        ready && "text-foreground",
      )}
      aria-pressed={selected}
      aria-label={accessibleLabel}
      onClick={() => onSelect(item.id)}
    >
      {selected && (
        <span
          class={cn(
            "bg-primary absolute top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full",
            side === "left" ? "-right-1.5" : "-left-1.5",
          )}
        />
      )}
      <span
        class={cn(
          "flex size-5 items-center justify-center transition-transform group-hover:scale-105",
          !ready && !item.icon && "opacity-45 grayscale",
        )}
      >
        {Icon ? (
          <Icon class={cn("size-5", item.iconClass)} />
        ) : (
          <img alt="" class="size-5 rounded object-contain" src={item.iconUrl} />
        )}
      </span>
      {showStatus && (
        <span
          class={cn(
            "border-background absolute right-0.5 bottom-0.5 size-2 rounded-full border",
            item.state === "pending" && "bg-muted-foreground/60 animate-pulse",
            ready && "bg-success",
            item.state === "idle" && "bg-muted-foreground",
            item.state === "error" && "bg-destructive",
          )}
        />
      )}
    </button>
  );
}
