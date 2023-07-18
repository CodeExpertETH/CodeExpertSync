import { api } from 'api';
import { taskEither } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';

export type JwtPayload = Record<string, unknown>;

export const createToken =
  (clientId: ClientId) =>
  (payload: JwtPayload = {}): taskEither.TaskEither<string, string> =>
    api.create_jwt_tokens({
      ...payload,
      iss: clientId,
      exp: Math.floor(Date.now() / 1000) + 10,
    });
