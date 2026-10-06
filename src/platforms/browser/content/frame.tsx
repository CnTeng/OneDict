import type { Context } from "@common/types";
import { LookupPanel } from "@views/lookup-panel";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import * as z from "zod";
import { createAppServices } from "../app";

const lookupMessageSchema = z.object({
  action: z.literal("onedict:lookup"),
  data: z.object({
    word: z.string().min(1),
    context: z.object({ context: z.string(), lang: z.string() }).optional(),
  }),
});

function FrameApp({ services }: { services: ReturnType<typeof createAppServices> }) {
  const [lookup, setLookup] = useState<{
    id: number;
    word: string;
    context?: Context;
    tasks: ReturnType<typeof services.dictionary.lookup>;
  }>();

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      const message = lookupMessageSchema.safeParse(event.data);
      if (!message.success) return;
      const { word, context } = message.data.data;
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
          audioService={services.audio}
          tasks={lookup?.tasks}
          request={lookup ? { word: lookup.word, context: lookup.context } : undefined}
          ankiService={services.anki}
          aiService={services.ai}
        />
      </div>
    </div>
  );
}

const app = document.createElement("div");
app.className = "h-full";
const services = createAppServices();
render(<FrameApp services={services} />, app);
document.body.append(app);
window.addEventListener("pagehide", () => render(null, app), { once: true });
