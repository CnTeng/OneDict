import { cn } from "cn";

const buttonVariants = {
  outline:
    "border-input bg-background text-foreground hover:bg-muted/70 focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-1",
  ghost:
    "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-ring border-transparent bg-transparent shadow-none focus-visible:ring-1",
};

const buttonSizes = {
  default: "",
  iconSm: "h-8 w-8 p-0",
  iconXs: "h-6 w-6 p-0",
};

const previousDisabledState = new WeakMap<HTMLButtonElement, boolean>();

type ButtonOptions = {
  doc?: Document;
  title?: string;
  className?: string;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
};

export function buttonStyles({
  variant = "outline",
  size = "default",
  className,
}: Pick<ButtonOptions, "variant" | "size" | "className"> = {}) {
  return cn(
    "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium whitespace-nowrap shadow-xs transition-[background-color,border-color,color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
    buttonVariants[variant],
    buttonSizes[size],
    className,
  );
}

export function createButton({
  doc = document,
  title,
  className,
  variant,
  size,
}: ButtonOptions = {}) {
  const button = doc.createElement("button");
  button.type = "button";
  if (title) button.title = title;
  button.className = buttonStyles({ variant, size, className });
  return button;
}

export function setButtonLoading(button: HTMLButtonElement, loading: boolean) {
  const existingSpinner = button.querySelector("[data-role='spinner']");

  if (loading) {
    if (!previousDisabledState.has(button)) previousDisabledState.set(button, button.disabled);
    button.disabled = true;
    button.classList.add("relative", "text-transparent");

    if (existingSpinner) return;

    const spinner = button.ownerDocument.createElement("span");
    spinner.dataset.role = "spinner";
    spinner.className =
      "pointer-events-none absolute inset-0 m-auto h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent";
    button.append(spinner);
    return;
  }

  button.disabled = previousDisabledState.get(button) ?? false;
  previousDisabledState.delete(button);
  button.classList.remove("relative", "text-transparent");
  existingSpinner?.remove();
}
