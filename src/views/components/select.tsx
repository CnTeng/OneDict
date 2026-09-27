import { cn } from "cn";
import type { SelectHTMLAttributes } from "preact";
import { fieldControlClass } from "./input";

type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "class" | "className" | "role" | "multiple" | "size"
> & {
  class?: string;
};

export function Select({ class: className, ...props }: SelectProps) {
  return <select {...props} class={cn(fieldControlClass, className)} />;
}
