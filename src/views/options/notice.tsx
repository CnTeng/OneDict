import { LucideIcon } from "@views/components/icon";
import { cn } from "cn";
import { CircleCheck, Info, TriangleAlert } from "lucide";
import { useCallback, useEffect, useState } from "preact/hooks";

export interface SettingsStatus {
  level: "success" | "error" | "info";
  message: string;
}

const statusClasses: Record<SettingsStatus["level"], string> = {
  success:
    "border-[color:color-mix(in_srgb,var(--success)_45%,var(--border))] bg-[color:color-mix(in_srgb,var(--success)_12%,var(--background))] text-[var(--success)]",
  error:
    "border-[color:color-mix(in_srgb,var(--destructive)_45%,var(--border))] bg-[color:color-mix(in_srgb,var(--destructive)_12%,var(--background))] text-[var(--destructive)]",
  info: "border-[color:color-mix(in_srgb,var(--info)_45%,var(--border))] bg-[color:color-mix(in_srgb,var(--info)_12%,var(--background))] text-[var(--info)]",
};

const statusIcons = {
  success: CircleCheck,
  error: TriangleAlert,
  info: Info,
};

export function useSettingsStatus() {
  const [status, setStatus] = useState<SettingsStatus>();

  useEffect(() => {
    if (status?.level !== "success") return;
    const timer = setTimeout(() => setStatus(undefined), 3000);
    return () => clearTimeout(timer);
  }, [status]);

  const showStatus = useCallback(
    (level: SettingsStatus["level"], message: string) => setStatus({ level, message }),
    [],
  );
  const clearStatus = useCallback(() => setStatus(undefined), []);

  return { status, showStatus, clearStatus };
}

export function SettingsNotice({ status }: { status?: SettingsStatus }) {
  if (!status) return null;

  return (
    <div
      role={status.level === "error" ? "alert" : "status"}
      class={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
        statusClasses[status.level],
      )}
    >
      <LucideIcon
        iconNode={statusIcons[status.level]}
        className="mt-0.5 shrink-0"
        customAttrs={{ width: 16, height: 16 }}
      />
      <span>{status.message}</span>
    </div>
  );
}
