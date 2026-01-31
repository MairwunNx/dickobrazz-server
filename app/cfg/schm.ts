import { z } from "zod";

export const ConfigSchema = z.object({
  svc: z.object({
    port: z.number().default(3030),
    db: z.object({
      mongo: z.object({
        url: z.string(),
      }),
      redis: z.object({
        url: z.string(),
        password: z.string().optional(),
      }),
    }),
    rnd: z.object({
      rndorg: z.object({
        enabled: z.boolean().default(true),
        token: z.string().optional(),
      }),
      urandom: z.object({
        enabled: z.boolean().default(true),
      }),
    }),
    stt: z.object({
      enabled: z.boolean().default(true),
    }),
    csot: z.object({
      token: z.string(),
    }),
    auth: z.object({
      session_secret: z.string(),
      session_ttl_sec: z.number().default(604800),
    }),
  }),
});

export type AppConfig = z.infer<typeof ConfigSchema>;
