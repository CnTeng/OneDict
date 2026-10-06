import { errorMessage } from "@common/error";
import type { AiExplanationRequest, IAiService, IAnkiService } from "@common/types";
import { AddToAnkiButton } from "@views/components/add-to-anki-button";
import { Badge } from "@views/components/badge";
import { IconButton } from "@views/components/button";
import { Editor } from "@views/components/editor";
import { MarkdownContent } from "@views/components/markdown";
import type { SidebarItemState } from "@views/components/sidebar";
import { StatusMessage } from "@views/components/status-message";
import { Eye, LoaderCircle, RefreshCw, SquarePen, TriangleAlert, X } from "lucide-preact";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { LookupLayout } from "./lookup-panel/layout";

interface AiExplanationProps {
  request: AiExplanationRequest;
  aiService: IAiService;
  active: boolean;
  contextDraft: string;
  onContextChange: (value: string) => void;
  ankiService?: IAnkiService;
  onStateChange?: (state: SidebarItemState) => void;
}

export function AiExplanation({
  request,
  aiService,
  active,
  contextDraft,
  onContextChange,
  ankiService,
  onStateChange,
}: AiExplanationProps) {
  const { word, context } = request;
  const [draft, setDraft] = useState("");
  const [streamed, setStreamed] = useState("");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [editing, setEditing] = useState(false);
  const controller = useRef<AbortController | undefined>(undefined);
  const attempted = useRef(false);
  const EditIcon = editing ? Eye : SquarePen;
  const hasContent = generated || Boolean(loading && streamed.trim());
  const content = loading && streamed.trim() ? streamed : draft;

  useLayoutEffect(() => {
    attempted.current = false;
    controller.current = undefined;
    setDraft("");
    setStreamed("");
    setGenerated(false);
    setError(undefined);
    setLoading(false);
    setEditing(false);
    return () => controller.current?.abort();
  }, [word, context?.context, context?.lang, aiService]);

  useEffect(() => {
    onStateChange?.(loading ? "pending" : error ? "error" : generated ? "ready" : "idle");
  }, [loading, error, generated, onStateChange]);

  const generate = useCallback(async () => {
    if (controller.current && !controller.current.signal.aborted) return;
    attempted.current = true;
    const current = new AbortController();
    controller.current = current;
    setLoading(true);
    setStreamed("");
    setError(undefined);
    await Promise.resolve()
      .then(() => {
        current.signal.throwIfAborted();
        return aiService.explain(
          { word, context: { context: contextDraft, lang: context?.lang ?? "" } },
          current.signal,
          (content) => {
            if (controller.current === current && !current.signal.aborted) setStreamed(content);
          },
        );
      })
      .then(
        (text) => {
          if (controller.current !== current || current.signal.aborted) return;
          setDraft(text);
          setGenerated(true);
          setEditing(false);
        },
        (reason: unknown) => {
          if (controller.current === current && !current.signal.aborted)
            setError(errorMessage(reason));
        },
      )
      .finally(() => {
        if (controller.current !== current) return;
        controller.current = undefined;
        if (!current.signal.aborted) {
          setStreamed("");
          setLoading(false);
        }
      });
  }, [word, context, contextDraft, aiService]);

  useEffect(() => {
    if (active && !attempted.current) void generate();
  }, [active, generate, word, context?.context, context?.lang]);

  return (
    <LookupLayout
      label="AI explanation"
      busy={loading}
      context={contextDraft}
      onContextChange={onContextChange}
    >
      <div class="mb-2.5 flex items-center justify-between gap-3">
        <span title="Sends the selected text and context to your configured AI provider.">
          <Badge variant="secondary" class="text-[11px]">
            {generated ? "AI generated" : "AI explanation"}
          </Badge>
        </span>
        <div class="flex shrink-0 items-center gap-0.5">
          {(generated || error || (!loading && attempted.current)) && (
            <IconButton
              title={generated ? "Regenerate explanation" : "Retry explanation"}
              aria-label={generated ? "Regenerate explanation" : "Retry explanation"}
              disabled={loading}
              onClick={() => void generate()}
            >
              <RefreshCw class="size-4" />
            </IconButton>
          )}
          {generated && (
            <>
              <IconButton
                title={editing ? "Preview explanation" : "Edit explanation"}
                aria-label={editing ? "Preview explanation" : "Edit explanation"}
                disabled={loading}
                aria-pressed={editing}
                onClick={() => setEditing((current) => !current)}
              >
                <EditIcon class="size-4" />
              </IconButton>
              {ankiService && (
                <AddToAnkiButton
                  key={JSON.stringify([word, contextDraft, draft])}
                  disabled={!draft.trim() || loading}
                  onAdd={() =>
                    ankiService.createTextNote({
                      text: word,
                      context: contextDraft,
                      explanation: draft,
                    })
                  }
                />
              )}
            </>
          )}
          {loading && (
            <IconButton
              title="Cancel generation"
              aria-label="Cancel generation"
              onClick={() => {
                controller.current?.abort();
                controller.current = undefined;
                setStreamed("");
                setLoading(false);
              }}
            >
              <X class="size-4" />
            </IconButton>
          )}
        </div>
      </div>
      {hasContent && loading && (
        <p role="status" class="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
          <LoaderCircle class="size-3.5 animate-spin" />
          Generating explanation...
        </p>
      )}
      {generated && error && (
        <p role="alert" class="text-destructive mb-2 text-sm">
          {error}
        </p>
      )}
      {!hasContent && (
        <StatusMessage
          class="min-h-40"
          error={Boolean(error)}
          spin={loading || !attempted.current}
          icon={error ? TriangleAlert : loading || !attempted.current ? LoaderCircle : X}
          message={
            error ??
            (loading || !attempted.current ? "Generating explanation..." : "Generation canceled.")
          }
        />
      )}
      {hasContent && (
        <div class="flex flex-col gap-1 pt-1.5 pb-1.5">
          <div class="text-foreground min-w-0 text-[0.95rem] leading-relaxed wrap-break-word whitespace-pre-wrap">
            {editing && !loading ? (
              <Editor
                value={draft}
                disabled={loading}
                ariaLabel="AI explanation draft"
                appearance="content"
                placeholder="Edit explanation (Markdown supported)..."
                onChanged={setDraft}
              />
            ) : content.trim() ? (
              <MarkdownContent source={content} />
            ) : (
              <span class="text-muted-foreground">
                The explanation is empty. Use Edit to write a note.
              </span>
            )}
          </div>
        </div>
      )}
    </LookupLayout>
  );
}
