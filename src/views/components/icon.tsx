import type { IconNode, SVGProps } from "lucide";
import { createElement } from "preact";

const defaultAttributes: SVGProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
};

type CreateSVGElementParams = [tag: string, attrs: SVGProps, children?: IconNode];

export type IconOptions = {
  doc: Document;
  iconNode: IconNode;
  className?: string;
  customAttrs?: SVGProps;
};

interface LucideIconProps {
  iconNode: IconNode;
  className?: string;
  customAttrs?: SVGProps;
}

export function LucideIcon({ iconNode, className, customAttrs }: LucideIconProps) {
  return createElement(
    "svg",
    { ...defaultAttributes, ...customAttrs, class: className },
    iconNode.map(([tag, attrs], index) => createElement(tag, { ...attrs, key: `${tag}-${index}` })),
  );
}

export function createIconElement({ doc, iconNode, className, customAttrs }: IconOptions) {
  const attrs: SVGProps = {
    ...defaultAttributes,
    ...customAttrs,
  };

  if (className) attrs.class = className;

  return createSVGElement(doc, ["svg", attrs, iconNode]);
}

function createSVGElement(doc: Document, [tag, attrs, children]: CreateSVGElementParams) {
  const element = doc.createElementNS("http://www.w3.org/2000/svg", tag);

  Object.entries(attrs).forEach(([name, value]) => {
    element.setAttribute(name, String(value));
  });

  children?.forEach((child) => element.append(createSVGElement(doc, child)));

  return element;
}
