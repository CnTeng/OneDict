import type { Context } from "@common/types";
import { AppServices } from "@services/app";
import { LookupPanel } from "@views/lookup-panel";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";

function FrameApp({ services }: { services: AppServices }) {
  const [lookup, setLookup] = useState<{
    id: number;
    word: string;
    context?: Context;
    tasks: ReturnType<typeof services.dictionary.lookup>;
  }>();

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.action !== "onedict:lookup") return;
      const { word, context } = (event.data?.data ?? {}) as {
        word?: string;
        context?: Context;
      };
      if (!word) return;
      const tasks = services.dictionary.lookup(word, context);
      setLookup((current) => ({
        id: (current?.id ?? 0) + 1,
        word,
        context,
        tasks,
      }));
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ action: "onedict:ready" }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, [services]);

  return (
    <div class="bg-background text-foreground flex h-full min-h-0 flex-col overflow-hidden">
      <div class="flex h-0 flex-1 flex-col">
        <LookupPanel
          key={lookup?.id}
          ownerDocument={document}
          tasks={lookup?.tasks}
          request={lookup ? { word: lookup.word, context: lookup.context } : undefined}
          ankiService={services.anki}
        />
      </div>
    </div>
  );
}

const app = document.createElement("div");
app.className = "h-full";
const services = new AppServices();
render(<FrameApp services={services} />, app);
document.body.append(app);
window.addEventListener("pagehide", () => render(null, app), { once: true });
