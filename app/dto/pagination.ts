import { z } from "zod";

export const PageMetaSchema = z.object({
  limit: z.number().optional(),
  page: z.number().optional(),
  next_cursor: z.string().optional(),
  prev_cursor: z.string().optional(),
  total: z.number().optional(),
});

export type PageMeta = z.infer<typeof PageMetaSchema>;
