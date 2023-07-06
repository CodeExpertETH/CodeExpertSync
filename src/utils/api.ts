import * as http from '@tauri-apps/api/http';
import { api } from 'api';
import { iots, pipe, taskEither } from '@code-expert/prelude';
import { config } from '@/config';
import { ClientId } from '@/domain/ClientId';
import { EntityNotFoundException, Exception, invariantViolated } from '@/domain/exception';
import { HttpError, RequestBody, httpGet, httpPost } from '@/lib/tauri/http';

export { requestBody } from '@/lib/tauri/http';

export type JwtPayload = Record<string, unknown>;

export interface ApiGetOptions<A> extends Omit<http.FetchOptions, 'method' | 'body'> {
  path: string;
  codec: iots.Decoder<unknown, A>;
  token?: string;
}

export interface ApiPostOptions<A> extends ApiGetOptions<A> {
  body?: RequestBody;
}

export interface ApiGetSignedOptions<A> extends ApiGetOptions<A> {
  jwtPayload?: JwtPayload;
}

export interface ApiPostSignedOptions<A> extends ApiPostOptions<A> {
  jwtPayload?: JwtPayload;
}

export const apiGet = <A>({
  path,
  ...options
}: ApiGetOptions<A>): taskEither.TaskEither<HttpError, A> => {
  const url = new URL(path, config.CX_API_URL).href;
  return httpGet(url, { ...options });
};

export const apiPost = <A>({
  path,
  ...options
}: ApiPostOptions<A>): taskEither.TaskEither<HttpError, A> => {
  const url = new URL(path, config.CX_API_URL).href;
  return httpPost(url, { ...options });
};

export const apiGetSigned = <A>({
  jwtPayload = {},
  ...options
}: ApiGetSignedOptions<A>): taskEither.TaskEither<Exception, A> =>
  pipe(
    readClientId,
    taskEither.chain((clientId) => createToken(clientId)(jwtPayload)),
    taskEither.chainW((token) =>
      pipe(
        apiGet({ ...options, token }),
        taskEither.mapLeft((e) => invariantViolated(e._tag)),
      ),
    ),
  );

export const apiPostSigned = <A>({
  jwtPayload = {},
  ...options
}: ApiPostSignedOptions<A>): taskEither.TaskEither<Exception, A> =>
  pipe(
    readClientId,
    taskEither.chain((clientId) => createToken(clientId)(jwtPayload)),
    taskEither.chainW((token) =>
      pipe(
        apiPost({ ...options, token }),
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
