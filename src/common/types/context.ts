import * as z from "zod";

export const contextSchema = z.object({
  context: z.string(),
  lang: z.string(),
});

export type Context = z.output<typeof contextSchema>;
