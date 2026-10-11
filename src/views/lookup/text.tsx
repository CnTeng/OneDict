import { errorMessage } from "@common/error";
import { t } from "@common/i18n";
import type { IAiService, IAnkiService, LookupRequest } from "@common/types";
import { Badge } from "@views/components/badge";
import { IconButton } from "@views/components/button";
import { Editor } from "@views/components/editor";
import type { SidebarItemState } from "@views/components/sidebar";
import { TextExplanation } from "@views/components/text";
import { Eye, LoaderCircle, RefreshCw, SquarePen, TriangleAlert, X } from "lucide-preact";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { AddButton } from "./add-button";
import { LookupLayout } from "./layout";
import { StatusMessage } from "./status";

interface TextLookupProps {
  request: LookupRequest;
  aiService: IAiService;
  active: boolean;
  contextDraft: string;
  onContextChange: (value: string) => void;
  ankiService?: IAnkiService;
  onStateChange?: (state: SidebarItemState) => void;
}

export function TextLookup({
  request,
  aiService,
  active,
  contextDraft,
  onContextChange,
  ankiService,
  onStateChange,
}: TextLookupProps) {
  const { text, context } = request;
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
  const waiting = loading || !attempted.current;

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
  }, [text, context?.context, context?.lang, aiService]);

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
          { text, context: { context: contextDraft, lang: context?.lang ?? "" } },
          current.signal,
          (content) => {
            if (controller.current === current && !current.signal.aborted) setStreamed(content);
          },
        );
      })
      .then(
        (entry) => {
          if (controller.current !== current || current.signal.aborted) return;
          setDraft(entry.explanation);
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
  }, [text, context, contextDraft, aiService]);

  useEffect(() => {
    if (active && !attempted.current) void generate();
  }, [active, generate, text, context?.context, context?.lang]);

  return (
    <LookupLayout
      label={t("ai.explanation")}
      busy={loading}
      context={contextDraft}
      onContextChange={onContextChange}
    >
      <div class="mb-2.5 flex items-center justify-between gap-3">
        <span title={t("ai.privacyHint")}>
          <Badge variant="secondary" class="text-[11px]">
            {generated ? t("ai.generated") : t("ai.explanation")}
          </Badge>
        </span>
        <div class="flex shrink-0 items-center gap-0.5">
          {(generated || error || (!loading && attempted.current)) && (
            <IconButton
              label={generated ? t("ai.regenerate") : t("ai.retry")}
              disabled={loading}
              onClick={() => void generate()}
            >
              <RefreshCw class="size-4" />
            </IconButton>
          )}
          {generated && (
            <>
              <IconButton
                label={editing ? t("ai.preview") : t("ai.edit")}
                disabled={loading}
                aria-pressed={editing}
                onClick={() => setEditing((current) => !current)}
              >
                <EditIcon class="size-4" />
              </IconButton>
              {ankiService && (
                <AddButton
                  key={JSON.stringify([text, contextDraft, draft])}
                  disabled={!draft.trim() || loading}
                  onAdd={() =>
                    ankiService.createTextNote(
                      {
                        text,
                        explanation: draft,
                      },
                      contextDraft,
                    )
                  }
                />
              )}
            </>
          )}
          {loading && (
            <IconButton
              label={t("ai.cancel")}
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
          {t("ai.generatingStatus")}
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
          spin={waiting}
          icon={error ? TriangleAlert : waiting ? LoaderCircle : X}
          message={error ?? (waiting ? t("ai.generatingStatus") : t("ai.canceled"))}
        />
      )}
      {hasContent && (
        <div class="flex flex-col gap-1 pt-1.5 pb-1.5">
          {editing && !loading ? (
            <div class="text-foreground wrap-break-text min-w-0 text-[0.95rem] leading-relaxed whitespace-pre-wrap">
              <Editor
                value={draft}
                ariaLabel={t("ai.draft")}
                appearance="content"
                placeholder={t("ai.editorPlaceholder")}
                onChanged={setDraft}
              />
            </div>
          ) : content.trim() ? (
            <TextExplanation explanation={content} className="wrap-break-text min-w-0" />
          ) : (
            <div class="text-foreground wrap-break-text min-w-0 text-[0.95rem] leading-relaxed whitespace-pre-wrap">
              <span class="text-muted-foreground">{t("ai.emptyExplanation")}</span>
            </div>
          )}
        </div>
      )}
    </LookupLayout>
  );
}
