import { LookupPanel } from "@views/lookup-panel";
import { SearchBar } from "@views/search-bar";
import { render } from "preact";
import { useState } from "preact/hooks";
import { createAppServices } from "../app";

function PopupApp({ services }: { services: ReturnType<typeof createAppServices> }) {
  const [lookup, setLookup] = useState<{
    id: number;
    word: string;
    tasks: ReturnType<typeof services.dictionary.lookup>;
  }>();

  return (
    <div
      class="bg-background/96 text-foreground border-border/60 flex h-12 min-h-0 flex-col overflow-hidden border shadow-[0_10px_30px_rgb(0_0_0/0.10)] backdrop-blur-sm transition-[height] duration-300 ease-out data-[state=expanded]:h-120"
      data-state={lookup ? "expanded" : "collapsed"}
    >
      <SearchBar
        dictionaryService={services.dictionary}
        onOpenSettings={() => void chrome.runtime.openOptionsPage()}
        onSubmit={({ word, tasks }) => {
          setLookup((current) => ({ id: (current?.id ?? 0) + 1, word, tasks }));
        }}
      />
      <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
        <LookupPanel
          key={lookup?.id}
          audioService={services.audio}
          tasks={lookup?.tasks}
          request={lookup ? { word: lookup.word } : undefined}
          ankiService={services.anki}
          aiService={services.ai}
        />
      </div>
    </div>
  );
}

function init() {
  const services = createAppServices();
  const app = document.createElement("div");
  render(<PopupApp services={services} />, app);
  document.body.append(app);

  return () => {
    render(null, app);
    app.remove();
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("pagehide", init(), { once: true });
  });
} else {
  window.addEventListener("pagehide", init(), { once: true });
}
