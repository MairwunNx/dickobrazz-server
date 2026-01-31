import { z } from "zod";

export const PageMetaSchema = z.object({
  limit: z.number().optional(),
  page: z.number().optional(),
  total: z.number().optional(),
});

export type PageMeta = z.infer<typeof PageMetaSchema>;
