import type { RespectResponse } from "./types";

// todo: добавить кол-во респектов за победы в сезоне и за выполненные ачивки (два отдельных еще поля) ну и + total_respect так и остается
export const createGetRespectAction = () => async (): Promise<RespectResponse> => ({
  total_respect: 0,
});

createGetRespectAction.inject = [] as const;
