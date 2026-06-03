export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export function parsePagination(
  page?: string | number,
  limit?: string | number,
): PaginationParams {
  const pageNum = Math.max(1, parseInt(String(page || 1), 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(String(limit || 25), 10)));

  return {
    page: pageNum,
    limit: limitNum,
  };
}

export function calculatePagination(
  total: number,
  page: number,
  limit: number,
): { skip: number; totalPages: number; hasMore: boolean } {
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return { skip, totalPages, hasMore };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return {
    data,
    page,
    limit,
    total,
    totalPages,
    hasMore,
  };
}
