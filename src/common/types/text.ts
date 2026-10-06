import * as z from "zod";

export const textEntrySchema = z.object({
  text: z.string(),
  explanation: z.string(),
});

export type TextEntry = z.output<typeof textEntrySchema>;
