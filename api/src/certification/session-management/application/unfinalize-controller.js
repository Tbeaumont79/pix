import { usecases } from '../domain/usecases/index.js';

export const unfinalizeSession = async function (request, h) {
  const sessionId = request.params.sessionId;
  await usecases.unfinalizeSession({ sessionId });

  return h.response().code(204);
};

const unfinalizeController = {
  unfinalizeSession,
};

export { unfinalizeController };
