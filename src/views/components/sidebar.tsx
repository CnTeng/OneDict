import { cn } from "cn";
import type { LucideIcon } from "lucide-preact";
import { type ComponentChildren, createContext } from "preact";
import { useContext, useId } from "preact/hooks";

const SidebarContext = createContext<{ id: string; selectedId: string } | undefined>(undefined);

export type SidebarItemState = "pending" | "ready" | "idle" | "error";

export type SidebarItem = {
  id: string;
  label: string;
  state?: SidebarItemState;
  statusLabel?: string;
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
  class?: string;
  children: ComponentChildren;
}

export function Sidebar({ children, class: className, side = "right", ...props }: SidebarProps) {
  const id = useId();
  return (
    <SidebarContext.Provider value={{ id, selectedId: props.selectedId }}>
      <div class={cn("flex min-h-0 min-w-0 flex-1 overflow-hidden", className)}>
        <SidebarNavigation {...props} id={id} side={side} />
        <div class="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </SidebarContext.Provider>
  );
}

function SidebarNavigation({
  id,
  items,
  selectedId,
  ariaLabel,
  onSelect,
  side = "right",
  showStatus = true,
}: Omit<SidebarProps, "class" | "children"> & { id: string }) {
  const selectedIndex = items.findIndex((item) => item.id === selectedId);

  return (
    <aside
      aria-label={ariaLabel}
      class={cn(
        "border-border/80 bg-muted/30 flex min-h-0 shrink-0 flex-col items-center overflow-x-hidden overflow-y-auto px-1.5 py-2",
        side === "left" ? "border-r" : "order-last border-l",
      )}
    >
      <div class="relative flex flex-col gap-1">
        {selectedIndex >= 0 && (
          <span
            aria-hidden="true"
            class={cn(
              "bg-primary pointer-events-none absolute top-2.5 h-4 w-0.5 translate-y-(--sidebar-offset) rounded-full transition-transform duration-200 ease-out motion-reduce:transition-none",
              side === "left" ? "-right-1.5" : "-left-1.5",
            )}
            style={{
              "--sidebar-offset": `${selectedIndex * 2.5}rem`,
            }}
          />
        )}
        {items.map((item) => (
          <SidebarButton
            key={item.id}
            item={item}
            sidebarId={id}
            selected={item.id === selectedId}
            onSelect={onSelect}
            showStatus={showStatus}
          />
        ))}
      </div>
    </aside>
  );
}

interface SidebarButtonProps {
  sidebarId: string;
  item: SidebarItem;
  selected: boolean;
  onSelect: (id: string) => void;
  showStatus: boolean;
}

function SidebarButton({ sidebarId, item, selected, onSelect, showStatus }: SidebarButtonProps) {
  const Icon = item.icon;
  const ready = !item.state || item.state === "ready";
  const accessibleLabel =
    showStatus && item.statusLabel ? `${item.label}: ${item.statusLabel}` : item.label;

  return (
    <button
      type="button"
      id={`${sidebarId}-${item.id}-button`}
      aria-controls={selected ? `${sidebarId}-${item.id}-panel` : undefined}
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
      {showStatus && item.state && (
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

export function SidebarPanel({
  itemId,
  active,
  class: className,
  children,
}: {
  itemId?: string;
  active?: boolean;
  class?: string;
  children: ComponentChildren;
}) {
  const sidebar = useContext(SidebarContext);
  if (!sidebar) throw new Error("SidebarPanel must be rendered inside Sidebar.");
  return (
    <div
      id={itemId ? `${sidebar.id}-${itemId}-panel` : undefined}
      role={itemId ? "region" : undefined}
      aria-labelledby={itemId ? `${sidebar.id}-${itemId}-button` : undefined}
      hidden={!(active ?? (!itemId || itemId === sidebar.selectedId))}
      class={cn(
        "motion-safe:animate-sidebar-enter flex min-h-0 min-w-0 flex-1 flex-col",
        className,
      )}
    >
      {children}
    </div>
  );
}
