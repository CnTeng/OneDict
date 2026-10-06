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
      ariaLabel="Context and note"
      className={className}
      placeholder="Context / Note (Markdown supported)..."
      onChanged={onChanged}
    />
  );
}
