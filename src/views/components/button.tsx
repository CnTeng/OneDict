import { cn } from "cn";
import { LoaderCircle } from "lucide-preact";
import type { ComponentProps } from "preact";

const buttonBaseClass = cn(
  "focus-visible:border-ring focus-visible:ring-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-md border text-sm font-medium shadow-xs transition-[background-color,border-color,color,box-shadow] outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
);

const buttonVariantClasses = {
  success: cn("border-success/50 bg-background text-success hover:bg-success/10"),
  destructive: cn("border-destructive/50 bg-background text-destructive hover:bg-destructive/10"),
  outline: cn("border-border bg-background text-foreground hover:bg-muted/70"),
  ghost: cn(
    "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent bg-transparent shadow-none",
  ),
};

type ButtonProps = Omit<ComponentProps<"button">, "class" | "className"> & {
  class?: string;
  label?: string;
  variant?: keyof typeof buttonVariantClasses;
  loading?: boolean;
  size?: "default" | "icon";
};

export function Button({
  children,
  class: className,
  label,
  variant = "outline",
  loading = false,
  disabled,
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      title={props.title ?? label}
      aria-label={props["aria-label"] ?? label}
      type={type}
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

type IconButtonProps = Omit<ButtonProps, "size" | "variant" | "label"> & {
  label: string;
  size?: "sm" | "xs";
};

export function IconButton({ class: className, size = "sm", ...props }: IconButtonProps) {
  return (
    <Button
      {...props}
      variant="ghost"
      size="icon"
      class={cn(size === "xs" ? "size-6" : "size-8", className)}
    />
  );
}
