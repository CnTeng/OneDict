import type { Metadata } from "@common/types";
import { Badge } from "@views/components/badge";
import { LucideIcon } from "@views/components/icon";
import { cn } from "cn";
import { Star } from "lucide";

const FREQUENCY_STAR_COUNT = 5;

interface DictionaryMetadataSectionProps {
  metadata: Metadata;
  className?: string;
}

export function DictionaryMetadataSection({ metadata, className }: DictionaryMetadataSectionProps) {
  const tags = metadata.tags ?? [];
  const frequency = metadata.frequency ?? 0;
  if (tags.length === 0 && frequency === 0) return null;

  return (
    <div class={cn("flex items-center gap-3", className ?? "mb-2.5")}>
      {frequency > 0 && (
        <div class="flex items-center gap-0.5">
          {Array.from({ length: FREQUENCY_STAR_COUNT }, (_, index) => (
            <LucideIcon
              key={index}
              iconNode={Star}
              className={cn(
                "h-4 w-4",
                index < frequency ? "text-warning fill-current" : "text-muted-foreground",
              )}
            />
          ))}
        </div>
      )}
      {tags.length > 0 && (
        <div class="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <Badge key={`${tag}-${index}`} variant="secondary" class="gap-1 text-[11px]">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
