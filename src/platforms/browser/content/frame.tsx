import { i18n } from "@common/i18n";
import type { IAppServices, LookupRequest, WordLookupTask } from "@common/types";
import { lookupRequestSchema } from "@common/types/lookup";
import { LookupPanel } from "@views/lookup";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import * as z from "zod";
import { createAppServices } from "../app";

const lookupMessageSchema = z.object({
  action: z.literal("onedict:lookup"),
  data: lookupRequestSchema,
});

function FrameApp({ services }: { services: IAppServices }) {
  const [lookup, setLookup] = useState<{
    id: number;
    request: LookupRequest;
    tasks: WordLookupTask[];
  }>();

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      const message = lookupMessageSchema.safeParse(event.data);
      if (!message.success) return;
      const request = message.data.data;
      const tasks = services.dictionary.lookup(request);
      setLookup((current) => ({
        id: (current?.id ?? 0) + 1,
        request,
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
          request={lookup?.request}
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
void i18n.changeLanguage(chrome.i18n.getUILanguage());
document.documentElement.lang = i18n.resolvedLanguage ?? "en";
render(<FrameApp services={services} />, app);
document.body.append(app);
window.addEventListener(
  "pagehide",
  () => {
    render(null, app);
  },
  { once: true },
);
