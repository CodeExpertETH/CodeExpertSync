import * as http from '@tauri-apps/api/http';
import { api } from 'api';
import {
  constant,
  either,
  flow,
  identity,
  iots,
  pipe,
  tagged,
  task,
  taskEither,
} from '@code-expert/prelude';
import { config } from '@/config';
import { ClientId } from '@/domain/ClientId';
import { HttpError, RequestBody, httpError, httpGet, httpPost } from '@/lib/tauri/http';
import { panic } from '@/utils/error';
import { JwtPayload, createToken } from '@/utils/jwt';

export { requestBody } from '@/lib/tauri/http';

export interface ApiGetOptions<A> extends Omit<http.FetchOptions, 'method' | 'body'> {
  path: string;
  codec: iots.Type<A, unknown>;
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
  codec,
  ...options
}: ApiGetOptions<A>): taskEither.TaskEither<ApiError, A> => {
  const url = new URL(path, config.CX_API_URL).href;
  return pipe(
    httpGet(url, { ...options, valueCodec: codec, errorCodec: ResponseError }),
    task.map(fromHttpError),
  );
};

export const apiPost = <A>({
  path,
  codec,
  ...options
}: ApiPostOptions<A>): taskEither.TaskEither<ApiError, A> => {
  const url = new URL(path, config.CX_API_URL).href;
  return pipe(
    httpPost(url, { ...options, valueCodec: codec, errorCodec: ResponseError }),
    task.map(fromHttpError),
  );
};

export const apiTryGetSigned = <A>({
  jwtPayload = {},
  ...options
}: ApiGetSignedOptions<A>): taskEither.TaskEither<ApiError, A> =>
  pipe(
    readClientId,
    taskEither.chain(createJWT(jwtPayload)),
    taskEither.chain((token) => apiGet({ ...options, token })),
  );

export const apiGetSigned: <A>(
  options: ApiGetSignedOptions<A>,
) => taskEither.TaskEither<ApiError, A> = flow(
  apiTryGetSigned,
  taskEither.mapLeft((e) =>
    apiError.fold(e, {
      notReady: panic,
      noNetwork: constant(e),
      clientError: constant(e),
      serverError: constant(e),
    }),
  ),
);

export const apiPostSigned = <A>({
  jwtPayload = {},
  ...options
}: ApiPostSignedOptions<A>): taskEither.TaskEither<ApiError, A> =>
  pipe(
    readClientId,
    taskEither.getOrElse(flow(apiErrorToMessage, panic)),
    task.chain(flow(createJWT(jwtPayload), taskEither.getOrElse(flow(apiErrorToMessage, panic)))),
    task.chain((token) => apiPost({ ...options, token })),
  );

// -------------------------------------------------------------------------------------------------

export type ApiError =
  | tagged.Tagged<'notReady', string>
  | tagged.Tagged<'noNetwork'>
  | tagged.Tagged<'clientError', { statusCode: number; message: string }>
  | tagged.Tagged<'serverError', { statusCode: number; message: string }>;

export const apiError = tagged.build<ApiError>();

export const apiErrorToMessage: (err: ApiError) => string = apiError.fold({
  notReady: identity,
  noNetwork: () => 'Network is not available',
  clientError: (e) => `Client error (${e.statusCode}): ${e.message}`,
  serverError: (e) => `Server error (${e.statusCode}): ${e.message}`,
});

// -------------------------------------------------------------------------------------------------

const ResponseError = iots.strict({
  statusCode: iots.number,
  error: iots.string,
  message: iots.string,
});

type ResponseError = iots.TypeOf<typeof ResponseError>;

const fromHttpError = <A>(
  value: either.Either<HttpError, either.Either<ResponseError, A>>,
): either.Either<ApiError, A> =>
  pipe(
    value,
    either.mapLeft(
      httpError.fold({
        noNetwork: () => apiError.wide.noNetwork(),
        unknownBodyType: (errs) => panic(`Payload did not match specification: ${errs.join('; ')}`),
      }),
    ),
    either.chain(
      either.fold(
        (e) => either.left(fromResponseError(e)),
        (a) => either.right(a),
      ),
    ),
  );

const fromResponseError = ({ statusCode, message }: ResponseError): ApiError => {
  if (statusCode >= 500 && statusCode < 600) return apiError.serverError({ statusCode, message });
  if (statusCode >= 400 && statusCode < 500) return apiError.clientError({ statusCode, message });
  panic(`Request failed with unsupported status code (${statusCode}: ${message})`);
};

// -------------------------------------------------------------------------------------------------

const createJWT =
  (payload: JwtPayload) =>
  (clientId: ClientId): taskEither.TaskEither<ApiError, string> =>
    pipe(createToken(clientId)(payload), taskEither.mapLeft(apiError.wide.notReady));

const readClientId: taskEither.TaskEither<ApiError, ClientId> = pipe(
  api.settingRead('clientId', ClientId),
  taskEither.fromTaskOption(() =>
    apiError.notReady('No client id was found. Please contact the developers.'),
  ),
);
