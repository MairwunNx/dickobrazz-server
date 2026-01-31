import type { PageMeta } from "@/dto/pagination";

export const parsePaginationParams = (url: URL): { limit?: number; page?: number } => {
  const limit = url.searchParams.get("limit");
  const page = url.searchParams.get("page");

  return {
    limit: limit ? Number.parseInt(limit, 10) : undefined,
    page: page ? Number.parseInt(page, 10) : undefined,
  };
};

export const createPageMeta = (limit: number, total: number, page?: number): PageMeta => {
  return {
    limit,
    page,
    total,
  };
};
