import * as http from '@tauri-apps/api/http';
import { api } from 'api';
import { either, iots, option, pipe, tagged, task, taskEither } from '@code-expert/prelude';
import { config } from '@/config';
import { ClientId } from '@/domain/ClientId';
import { HttpError, RequestBody, httpError, httpGet, httpPost } from '@/lib/tauri/http';
import { toFatalError } from '@/utils/error';
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

export const apiGetSigned = <A>({
  jwtPayload = {},
  ...options
}: ApiGetSignedOptions<A>): taskEither.TaskEither<ApiError, A> =>
  pipe(
    readClientId,
    task.chain((clientId) => createToken(clientId)(jwtPayload)),
    taskEither.fromTask,
    taskEither.chainW((token) => apiGet({ ...options, token })),
  );

export const apiPostSigned = <A>({
  jwtPayload = {},
  ...options
}: ApiPostSignedOptions<A>): taskEither.TaskEither<ApiError, A> =>
  pipe(
    readClientId,
    task.chain((clientId) => createToken(clientId)(jwtPayload)),
    taskEither.fromTask,
    taskEither.chainW((token) => apiPost({ ...options, token })),
  );

// -------------------------------------------------------------------------------------------------

export type ApiError =
  | tagged.Tagged<'noNetwork'>
  | tagged.Tagged<'clientError', { statusCode: number; message: string }>
  | tagged.Tagged<'serverError', { statusCode: number; message: string }>;

export const apiError = tagged.build<ApiError>();

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
        invalidPayload: (errs) => {
          throw new Error(`Payload did not match specification: ${errs.join('; ')}`);
        },
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
  throw new Error(`Request failed with unsupported status code (${statusCode}: ${message})`);
};

// -------------------------------------------------------------------------------------------------

const readClientId: task.Task<ClientId> = pipe(
  api.settingRead('clientId', ClientId),
  task.map(
    option.getOrThrow(() => toFatalError('No client id was found. Please contact the developers.')),
  ),
);
