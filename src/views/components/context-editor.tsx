import { Editor } from "./editor";

interface ContextEditorProps {
  value: string;
  onChanged: (value: string) => void;
}

export function ContextEditor({ value, onChanged }: ContextEditorProps) {
  return (
    <div class="border-border/80 bg-muted/80 shrink-0 border-t">
      <Editor
        value={value}
        ariaLabel="Context and note"
        className="h-[20%] min-h-24"
        placeholder="Context / Note (Markdown supported)..."
        onChanged={onChanged}
      />
    </div>
  );
}
