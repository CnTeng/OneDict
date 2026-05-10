import { Icon } from "@views/components";
import { RotateCcw } from "lucide";
import { cn } from "tailwind-variants";
import { OptionsStatus } from "./elements";

export class OptionsFooter {
  readonly element: HTMLDivElement;
  readonly status: OptionsStatus;

  private readonly doc: Document;
  private readonly resetButton: HTMLButtonElement;
  private resetAction: (() => Promise<void>) | null = null;

  constructor(doc: Document) {
    this.doc = doc;
    this.status = new OptionsStatus(doc);

    this.element = doc.createElement("div");
    this.element.className = cn(
      "flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between",
    ) as string;

    this.resetButton = this.renderResetButton();
    this.element.append(this.resetButton, this.renderMeta());
    this.registerListeners();
  }

  setResetAction(action: () => Promise<void>) {
    this.resetAction = action;
  }

  private renderResetButton() {
    const button = this.doc.createElement("button");
    button.type = "button";
    button.title = "Reset all options to default";
    button.className = "btn btn-ghost w-full sm:w-auto";
    button.append(
      new Icon({
        doc: this.doc,
        iconNode: RotateCcw,
        customAttrs: { width: 16, height: 16 },
      }).element,
      this.doc.createTextNode("Reset Defaults"),
    );
    return button;
  }

  private renderMeta() {
    const hint = this.doc.createElement("p");
    hint.className = cn("text-xs") as string;
    hint.textContent =
      "Changes are saved automatically. Use reset only if you want to restore all defaults.";

    const footerRight = this.doc.createElement("div");
    footerRight.className = cn(
      "flex w-full flex-col items-start gap-2 sm:w-auto sm:items-end",
    ) as string;
    footerRight.append(hint, this.status.element);
    return footerRight;
  }

  private registerListeners() {
    this.resetButton.addEventListener("click", () => {
      if (!this.resetAction) return;

      this.resetButton.disabled = true;
      this.resetButton.classList.add("loading");
      void this.resetAction().finally(() => {
        this.resetButton.disabled = false;
        this.resetButton.classList.remove("loading");
      });
    });
  }
}
