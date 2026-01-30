import { z } from "zod";

export const HealthStatusSchema = z.enum(["ok", "degraded", "down"]);

export const HealthComponentsSchema = z.object({
  mongo: HealthStatusSchema.optional(),
  redis: HealthStatusSchema.optional(),
});

export const HealthResponseSchema = z.object({
  status: HealthStatusSchema,
  version: z.string().optional(),
  uptime: z.number().optional(),
  components: HealthComponentsSchema.optional(),
});

export type HealthStatus = z.infer<typeof HealthStatusSchema>;
export type HealthComponents = z.infer<typeof HealthComponentsSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
