import type { IAppServices, LookupRequest, WordLookupTask } from "@common/types";
import { LookupPanel } from "@views/lookup";
import { SearchBar } from "@views/search-bar";
import { render } from "preact";
import { useState } from "preact/hooks";
import { createAppServices } from "../app";

function PopupApp({ services }: { services: IAppServices }) {
  const [lookup, setLookup] = useState<{
    id: number;
    request: LookupRequest;
    tasks: WordLookupTask[];
  }>();

  return (
    <div
      class="border-border/60 bg-background/96 text-foreground flex h-12 min-h-0 flex-col overflow-hidden border shadow-[0_10px_30px_rgb(0_0_0/0.10)] backdrop-blur-sm transition-[height] duration-300 ease-out data-[state=expanded]:h-120"
      data-state={lookup ? "expanded" : "collapsed"}
    >
      <SearchBar
        onOpenSettings={() => void chrome.runtime.openOptionsPage()}
        onSearch={(text) => {
          const request = { text };
          const tasks = services.dictionary.lookup(request);
          setLookup((current) => ({ id: (current?.id ?? 0) + 1, request, tasks }));
        }}
      />
      <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
        <LookupPanel
          key={lookup?.id}
          audioService={services.audio}
          tasks={lookup?.tasks}
          request={lookup?.request}
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
  window.addEventListener(
    "pagehide",
    () => {
      render(null, app);
      app.remove();
    },
    { once: true },
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
