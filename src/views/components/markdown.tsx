import type { SyntaxNode } from "@lezer/common";
import { highlightCode, tagHighlighter, tags } from "@lezer/highlight";
import { GFM, parser } from "@lezer/markdown";
import { cn } from "cn";
import { type ComponentChild, h } from "preact";
import { useMemo } from "preact/hooks";

const markdownParser = parser.configure(GFM);
const markdownHighlighter = tagHighlighter([
  { tag: tags.heading, class: cn("text-foreground") },
  {
    tag: tags.strong,
    class: cn("decoration-foreground/35 underline decoration-2 underline-offset-2"),
  },
  {
    tag: tags.emphasis,
    class: cn("decoration-foreground/35 underline decoration-dotted underline-offset-2"),
  },
  { tag: tags.strikethrough, class: cn("line-through") },
  { tag: tags.monospace, class: cn("bg-muted text-foreground rounded-sm") },
  { tag: tags.quote, class: cn("text-muted-foreground") },
  { tag: tags.list, class: cn("text-foreground") },
  {
    tag: tags.link,
    class: cn("text-foreground decoration-foreground/35 underline underline-offset-2"),
  },
  { tag: tags.url, class: cn("text-muted-foreground") },
  { tag: tags.meta, class: cn("text-foreground/45") },
]);

const markdownElements = new Map(
  Object.entries({
    ATXHeading1: "h1",
    ATXHeading2: "h2",
    ATXHeading3: "h3",
    ATXHeading4: "h4",
    ATXHeading5: "h5",
    ATXHeading6: "h6",
    SetextHeading1: "h1",
    SetextHeading2: "h2",
    StrongEmphasis: "strong",
    Emphasis: "em",
    Strikethrough: "s",
    InlineCode: "code",
    BulletList: "ul",
    OrderedList: "ol",
    ListItem: "li",
  }),
);

const MARKDOWN_MARKS = new Set([
  "HeaderMark",
  "EmphasisMark",
  "StrikethroughMark",
  "CodeMark",
  "ListMark",
]);

const markdownClasses = new Map(
  Object.entries({
    p: cn("m-0 [&+p]:mt-3"),
    code: cn("bg-muted text-foreground rounded-sm px-1 font-mono text-[0.85em]"),
    ul: cn("my-2 list-disc space-y-1 pl-5 whitespace-normal first:mt-0 last:mb-0"),
    ol: cn("my-2 list-decimal space-y-1 pl-5 whitespace-normal first:mt-0 last:mb-0"),
    h1: cn("text-[1.15rem]"),
    h2: cn("text-[1.05rem]"),
    h3: cn("text-[0.95rem]"),
    h4: cn("text-[0.95rem]"),
    h5: cn("text-[0.9rem]"),
    h6: cn("text-[0.9rem]"),
  }),
);

export function highlightMarkdown(source: string): ComponentChild[] {
  const nodes: ComponentChild[] = [];
  highlightCode(
    source,
    markdownParser.parse(source),
    markdownHighlighter,
    (text, className) =>
      nodes.push(className ? h("span", { class: className, key: nodes.length }, text) : text),
    () => nodes.push("\n"),
  );
  return nodes;
}

function readMarkdownNode(node: SyntaxNode, source: string): ComponentChild[] {
  if (MARKDOWN_MARKS.has(node.name)) return [];

  const tagName =
    node.name === "Paragraph" &&
    (node.parent?.name === "Document" || node.parent?.name === "ListItem")
      ? "p"
      : markdownElements.get(node.name);
  const block =
    node.name === "Document" || tagName === "ul" || tagName === "ol" || tagName === "li";
  const children: ComponentChild[] = [];
  let position = node.from;
  const appendText = (end: number) => {
    const text = source.slice(position, end);
    if (text && (!block || text.trim())) children.push(text);
  };

  for (let child = node.firstChild; child; child = child.nextSibling) {
    appendText(child.from);
    children.push(...readMarkdownNode(child, source));
    position = child.to;
  }

  appendText(node.to);
  if (!tagName) return children;
  const heading = tagName.startsWith("h");
  const listMark = tagName === "ol" ? node.firstChild?.getChild("ListMark") : undefined;
  return [
    h(
      tagName,
      {
        key: node.from + ":" + node.to,
        start: listMark ? Number.parseInt(source.slice(listMark.from, listMark.to), 10) : undefined,
        class: cn(
          markdownClasses.get(tagName),
          heading &&
            "text-foreground mt-2 mb-1 leading-snug font-semibold whitespace-normal not-italic first:mt-0",
        ),
      },
      heading
        ? children.map((child, index) => {
            if (typeof child !== "string") return child;
            const text = index === 0 ? child.trimStart() : child;
            return index === children.length - 1 ? text.trimEnd() : text;
          })
        : children,
    ),
  ];
}

export function MarkdownContent({ source }: { source: string }) {
  const nodes = useMemo(
    () => readMarkdownNode(markdownParser.parse(source).topNode, source),
    [source],
  );
  return <>{nodes}</>;
}
