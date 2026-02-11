import type { RespectResponse } from "./types";

export const createGetRespectAction = () => async (): Promise<RespectResponse> => ({
  total_respect: 0,
});

createGetRespectAction.inject = [] as const;
