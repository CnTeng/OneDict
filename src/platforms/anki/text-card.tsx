import type { TextCard } from "@common/types";
import { ContentHeader } from "@views/components/content-header";
import { CardLayout } from "./components/card-layout";
import { TextContextSection, TextExplanationSection } from "./sections/text";

export function TextCardFront({ text, context }: Pick<TextCard, "text" | "context">) {
  return (
    <CardLayout side="front">
      <ContentHeader
        text={text}
        source="AI"
        className="mb-4 justify-center"
        textClassName="text-center whitespace-pre-wrap"
      />
      <TextContextSection text={text} context={context} />
    </CardLayout>
  );
}

export function TextCardBack({ explanation }: Pick<TextCard, "explanation">) {
  return (
    <CardLayout side="back">
      <TextExplanationSection explanation={explanation} />
    </CardLayout>
  );
}
