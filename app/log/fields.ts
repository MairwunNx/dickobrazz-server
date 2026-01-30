export interface LogFields {
  request_id?: string;
  user_id?: number;
  service?: string;
  operation?: string;
  duration_ms?: number;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  auth_type?: "telegram" | "internal";
  [key: string]: unknown;
}

export const standardFields = (fields: LogFields): LogFields => fields;
