import { ZodError } from "zod";
import { logger } from "@/shared/lib/logger";
import { AppError, failure } from "@/shared/net/response";

export const handleError = (err: Error): Response => {
  if (err instanceof ZodError) {
    logger.warn("Validation error", { errors: err.issues });
    return failure(err.issues[0]?.message || "Validation error", "VALIDATION_ERROR", 400);
  }

  if (err instanceof AppError) {
    logger.error("Application error", { code: err.code, message: err.message });
    return failure(err.message, err.code, err.statusCode);
  }

  logger.error("Unhandled error", {
    error: { message: err.message, stack: err.stack },
  });

  return failure("Internal server error", "INTERNAL_ERROR", 500);
};
