import { t } from "@common/i18n";
import type { IAiService, IAnkiService, IConfigService } from "@common/types";
import { Sidebar, type SidebarItem, SidebarPanel } from "@views/components/sidebar";
import { Info, Sparkles, Star } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { AboutSettings } from "./about";
import { AiSettings } from "./ai";
import { AnkiSettings } from "./anki";

const settingsItems: readonly SidebarItem[] = [
  {
    id: "ai",
    label: "ai.title",
    icon: Sparkles,
    iconClass: "fill-current text-yellow-500",
  },
  {
    id: "anki",
    label: "anki.title",
    icon: Star,
    iconClass: "fill-current text-blue-500",
  },
  {
    id: "about",
    label: "about.title",
    icon: Info,
  },
];

interface OptionsPageProps {
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
      event.returnValue = t("settings.unsaved");
    };
    view.addEventListener("beforeunload", beforeUnload);
    return () => view.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  const selectSection = (id: string) => {
    if (id === selectedId) return;
    if (dirty && !root.current?.ownerDocument.defaultView?.confirm(t("settings.discard"))) return;
    setDirty(false);
    setSelectedId(id);
  };

  return (
    <div
      ref={root}
      class="border-border bg-background text-foreground flex w-full overflow-hidden rounded-lg border shadow-xs"
    >
      <Sidebar
        items={settingsItems.map((item) => ({ ...item, label: t(item.label) }))}
        selectedId={selectedId}
        ariaLabel={t("settings.sections")}
        onSelect={selectSection}
        side="left"
        showStatus={false}
      >
        <SidebarPanel key={selectedId} itemId={selectedId} class="px-4 py-6 sm:px-6">
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
        </SidebarPanel>
      </Sidebar>
    </div>
  );
}
