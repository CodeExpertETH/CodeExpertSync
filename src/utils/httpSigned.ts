import { api } from 'api';
import { pipe, taskEither } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { EntityNotFoundException, Exception, invariantViolated } from '@/domain/exception';
import { HttpGetOptions, HttpPostOptions, httpGet, httpPost } from '@/lib/tauri/http';

export type JwtPayload = Record<string, unknown>;

export interface HttpGetSignedOptions<A> extends HttpGetOptions<A> {
  jwtPayload?: JwtPayload;
}

export interface HttpPostSignedOptions<A> extends HttpPostOptions<A> {
  jwtPayload?: JwtPayload;
}

export const httpGetSigned = <A>({
  jwtPayload = {},
  ...options
}: HttpGetSignedOptions<A>): taskEither.TaskEither<Exception, A> =>
  pipe(
    readClientId,
    taskEither.chain((clientId) => createToken(clientId)(jwtPayload)),
    taskEither.chainW((token) =>
      pipe(
        httpGet({ ...options, token }),
        taskEither.mapLeft((e) => invariantViolated(e._tag)),
      ),
    ),
  );

export const httpPostSigned = <A>({
  jwtPayload = {},
  ...options
}: HttpPostSignedOptions<A>): taskEither.TaskEither<Exception, A> =>
  pipe(
    readClientId,
    taskEither.chain((clientId) => createToken(clientId)(jwtPayload)),
    taskEither.chainW((token) =>
      pipe(
        httpPost({ ...options, token }),
        taskEither.mapLeft((e) => invariantViolated(e._tag)),
      ),
    ),
  );

export const createToken =
  (clientId: ClientId) =>
  (payload: JwtPayload = {}) =>
    api.create_jwt_tokens({
      ...payload,
      iss: clientId,
      exp: Math.floor(Date.now() / 1000) + 10,
    });

// -------------------------------------------------------------------------------------------------

const readClientId: taskEither.TaskEither<Exception, ClientId> = pipe(
  api.settingRead('clientId', ClientId),
  taskEither.fromTaskOption(
    () => new EntityNotFoundException({}, 'No client id was found. Please contact the developers.'),
  ),
);
