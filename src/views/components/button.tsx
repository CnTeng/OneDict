import { cn } from "cn";
import { LoaderCircle } from "lucide-preact";
import type { ComponentProps } from "preact";

const buttonBaseClass =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md border text-sm font-medium shadow-xs transition-[background-color,border-color,color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50";

const buttonVariantClasses = {
  success: "border-success/50 bg-background text-success hover:bg-success/10",
  destructive: "border-destructive/50 bg-background text-destructive hover:bg-destructive/10",
  outline: "border-border bg-background text-foreground hover:bg-muted/70",
  ghost:
    "border-transparent bg-transparent text-muted-foreground shadow-none hover:bg-muted hover:text-foreground",
};

export const iconButtonClass = cn(buttonBaseClass, buttonVariantClasses.ghost, "size-8 p-0");

type ButtonProps = Omit<ComponentProps<"button">, "class" | "className"> & {
  class?: string;
  variant?: keyof typeof buttonVariantClasses;
  loading?: boolean;
  size?: "default" | "icon";
};

export function Button({
  children,
  class: className,
  variant = "outline",
  loading = false,
  disabled,
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      class={cn(
        buttonBaseClass,
        buttonVariantClasses[variant],
        "h-9 whitespace-nowrap",
        size === "icon" ? "w-9 p-0" : "px-3",
        loading && "relative text-transparent",
        className,
      )}
    >
      {loading && (
        <LoaderCircle
          class={cn(
            "absolute inset-0 m-auto size-4 animate-spin",
            variant === "success" ? "text-success" : "text-muted-foreground",
          )}
        />
      )}
      {children}
    </button>
  );
}

type IconButtonProps = Omit<ComponentProps<"button">, "class" | "className" | "size"> & {
  class?: string;
  size?: "sm" | "xs";
};

export function IconButton({ class: className, size = "sm", ...props }: IconButtonProps) {
  return (
    <button
      {...props}
      type="button"
      class={cn(iconButtonClass, size === "xs" && "size-6", className)}
    />
  );
}
