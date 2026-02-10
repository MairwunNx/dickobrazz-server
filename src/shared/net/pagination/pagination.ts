import { z } from "zod";

export const PAGE_LIMIT_MIN = 13;
export const PAGE_LIMIT_MAX = 50;

export const PageMetaSchema = z.object({
  limit: z.number().optional(),
  page: z.number().optional(),
  total: z.number().optional(),
  total_pages: z.number().optional(),
});

export type PageMeta = z.infer<typeof PageMetaSchema>;

const clampLimit = (raw: number | undefined): number | undefined => {
  if (raw === undefined || Number.isNaN(raw)) return undefined;
  return Math.max(PAGE_LIMIT_MIN, Math.min(PAGE_LIMIT_MAX, raw));
};

export const paginationFrom = (url: URL): { limit?: number; page?: number } => {
  const limit = url.searchParams.get("limit");
  const page = url.searchParams.get("page");

  const parsedPage = page ? Number.parseInt(page, 10) : undefined;

  return {
    limit: clampLimit(limit ? Number.parseInt(limit, 10) : undefined),
    page: parsedPage !== undefined && !Number.isNaN(parsedPage) && parsedPage >= 1 ? parsedPage : undefined,
  };
};

export const createPageMeta = (limit: number, total: number, page?: number): PageMeta => {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return { limit, page, total, total_pages: totalPages };
};
