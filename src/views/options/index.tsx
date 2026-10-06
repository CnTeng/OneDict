import type { IAiService, IAnkiService, IConfigService } from "@common/types";
import { Sidebar, type SidebarItem } from "@views/components/sidebar";
import { Info, Sparkles, Star } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { AboutSettings } from "./about";
import { AiSettings } from "./ai";
import { AnkiSettings } from "./anki";

const settingsItems: readonly SidebarItem[] = [
  {
    id: "ai",
    label: "AI",
    icon: Sparkles,
    iconClass: "fill-current text-yellow-500",
    state: "ready",
    statusLabel: "Settings",
  },
  {
    id: "anki",
    label: "Anki",
    icon: Star,
    iconClass: "fill-current text-blue-500",
    state: "ready",
    statusLabel: "Settings",
  },
  {
    id: "about",
    label: "About",
    icon: Info,
    state: "ready",
    statusLabel: "About OneDict",
  },
];

export interface OptionsPageProps {
  configService: IConfigService;
  ankiService: IAnkiService;
  aiService: IAiService;
  onOpenLink?: (url: string) => void;
}

export function OptionsPage({
  configService,
  ankiService,
  aiService,
  onOpenLink,
}: OptionsPageProps) {
  const [selectedId, setSelectedId] = useState("ai");
  const [dirty, setDirty] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const view = root.current?.ownerDocument.defaultView;
    if (!dirty || !view) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "You have unsaved changes.";
    };
    view.addEventListener("beforeunload", beforeUnload);
    return () => view.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  const selectSection = (id: string) => {
    if (id === selectedId) return;
    if (
      dirty &&
      !root.current?.ownerDocument.defaultView?.confirm(
        "You have unsaved changes. Discard them and switch sections?",
      )
    )
      return;
    setDirty(false);
    setSelectedId(id);
  };

  return (
    <div
      ref={root}
      class="border-border bg-background text-foreground flex w-full overflow-hidden rounded-lg border shadow-xs"
    >
      <Sidebar
        items={settingsItems}
        selectedId={selectedId}
        ariaLabel="Settings sections"
        onSelect={selectSection}
        side="left"
        showStatus={false}
      />
      <div class="min-w-0 flex-1">
        <div class="px-4 py-6 sm:px-6">
          {selectedId === "ai" ? (
            <AiSettings
              configService={configService.ai}
              aiService={aiService}
              onDirtyChange={setDirty}
            />
          ) : selectedId === "anki" ? (
            <AnkiSettings
              configService={configService.anki}
              ankiService={ankiService}
              onDirtyChange={setDirty}
            />
          ) : (
            <AboutSettings onOpenLink={onOpenLink} />
          )}
        </div>
      </div>
    </div>
  );
}
