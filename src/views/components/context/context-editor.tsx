import { t } from "@common/i18n";
import { Editor } from "../editor";

interface ContextEditorProps {
  value: string;
  onChanged: (value: string) => void;
  className?: string;
}

export function ContextEditor({ value, onChanged, className }: ContextEditorProps) {
  return (
    <Editor
      value={value}
      ariaLabel={t("context.label")}
      className={className}
      placeholder={t("context.placeholder")}
      onChanged={onChanged}
    />
  );
}
