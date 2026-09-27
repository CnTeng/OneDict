import type { TreeCursor } from "@lezer/common";
import { highlightTree, tagHighlighter, tags } from "@lezer/highlight";
import { GFM, parser } from "@lezer/markdown";
import { cn } from "cn";
import { type ComponentChild, h } from "preact";
import { useMemo } from "preact/hooks";

const markdownParser = parser.configure(GFM);
const markdownHighlighter = tagHighlighter([
  { tag: tags.heading, class: cn("text-primary") },
  { tag: tags.strong, class: cn("underline decoration-2 underline-offset-2") },
  { tag: tags.emphasis, class: cn("underline decoration-dotted underline-offset-2") },
  { tag: tags.strikethrough, class: cn("line-through") },
  { tag: tags.monospace, class: cn("bg-muted text-info rounded-sm") },
  { tag: tags.quote, class: cn("text-muted-foreground") },
  { tag: tags.list, class: cn("text-primary") },
  { tag: tags.link, class: cn("text-info underline underline-offset-2") },
  { tag: tags.url, class: cn("text-success") },
  { tag: tags.meta, class: cn("text-foreground/45") },
]);

const MARKDOWN_ELEMENTS = {
  StrongEmphasis: "strong",
  Emphasis: "em",
  Strikethrough: "s",
  InlineCode: "code",
} as const;

const MARKDOWN_MARKS = new Set(["EmphasisMark", "StrikethroughMark", "CodeMark"]);

interface MarkdownHighlightSegment {
  text: string;
  className?: string;
}

type MarkdownNode =
  | string
  | { tag: (typeof MARKDOWN_ELEMENTS)[keyof typeof MARKDOWN_ELEMENTS]; children: MarkdownNode[] };

export function getMarkdownHighlightSegments(source: string): MarkdownHighlightSegment[] {
  const segments: MarkdownHighlightSegment[] = [];
  let position = 0;

  highlightTree(markdownParser.parse(source), markdownHighlighter, (from, to, className) => {
    if (position < from) segments.push({ text: source.slice(position, from) });
    segments.push({ text: source.slice(from, to), className });
    position = to;
  });

  if (position < source.length) segments.push({ text: source.slice(position) });
  return segments;
}

function getMarkdownContentNodes(source: string): MarkdownNode[] {
  return readMarkdownNode(markdownParser.parse(source).cursor(), source);
}

function readMarkdownNode(cursor: TreeCursor, source: string): MarkdownNode[] {
  if (MARKDOWN_MARKS.has(cursor.name)) return [];

  const tagName = MARKDOWN_ELEMENTS[cursor.name as keyof typeof MARKDOWN_ELEMENTS];
  const children: MarkdownNode[] = [];
  let position = cursor.from;

  if (cursor.firstChild()) {
    do {
      const childFrom = cursor.from;
      const childTo = cursor.to;
      if (position < childFrom) children.push(source.slice(position, childFrom));
      children.push(...readMarkdownNode(cursor, source));
      position = childTo;
    } while (cursor.nextSibling());
    cursor.parent();
  }

  if (position < cursor.to) children.push(source.slice(position, cursor.to));
  return tagName ? [{ tag: tagName, children }] : children;
}

function renderNode(node: MarkdownNode, index: number): ComponentChild {
  if (typeof node === "string") return node;
  return h(
    node.tag,
    {
      key: index,
      class:
        node.tag === "code"
          ? cn("bg-muted text-foreground rounded-sm px-1 font-mono text-[0.85em]")
          : undefined,
    },
    node.children.map(renderNode),
  );
}

export function MarkdownContent({ source }: { source: string }) {
  const nodes = useMemo(() => getMarkdownContentNodes(source), [source]);
  return <>{nodes.map(renderNode)}</>;
}
