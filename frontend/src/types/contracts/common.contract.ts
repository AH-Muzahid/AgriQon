export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SuccessResponse {
  success: boolean;
  message?: string;
}
