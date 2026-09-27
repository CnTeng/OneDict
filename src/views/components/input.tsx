import { cn } from "cn";
import type { InputHTMLAttributes } from "preact";

export const fieldControlClass =
  "border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring block h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[border-color,box-shadow] outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50";

type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "class" | "className" | "role" | "type"
> & {
  class?: string;
  appearance?: "field" | "bare";
};

export function Input({ class: className, appearance = "field", ...props }: InputProps) {
  return (
    <input
      {...props}
      type="text"
      class={cn(
        appearance === "field"
          ? fieldControlClass
          : "text-foreground placeholder:text-muted-foreground w-full border-none bg-transparent text-sm shadow-none outline-none hover:border-transparent focus-visible:border-transparent focus-visible:shadow-none",
        className,
      )}
    />
  );
}
