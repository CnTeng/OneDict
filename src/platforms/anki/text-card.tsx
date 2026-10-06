import type { TextEntry } from "@common/types";
import { Context } from "@views/components/context";
import { TextExplanation, TextHeader } from "@views/components/text";
import { CardLayout } from "./card-layout";

export function TextCardFront({ text, context }: Pick<TextEntry, "text"> & { context?: string }) {
  return (
    <CardLayout side="front">
      <TextHeader text={text} source="AI" className="mb-4 justify-center" />
      <Context text={text} context={context} className="mt-3.5" />
    </CardLayout>
  );
}

export function TextCardBack({ explanation }: Pick<TextEntry, "explanation">) {
  return (
    <CardLayout side="back">
      <TextExplanation explanation={explanation} className="pt-1.5 pb-1.5 wrap-break-word" />
    </CardLayout>
  );
}
