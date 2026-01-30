import type { APIError, APIResponse } from "@/dto/response";

export const successResponse = <T>(data: T, status = 200): Response => {
  const response: APIResponse<T> = { data };
  return Response.json(response, { status });
};

export const errorResponse = (message: string, code = "ERROR", status = 400): Response => {
  const error: APIError = { message, code };
  const response: APIResponse = { error };
  return Response.json(response, { status });
};
