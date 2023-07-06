import { $Unexpressable } from '@code-expert/type-utils';
import * as http from '@tauri-apps/api/http';
import { constant, either, iots, option, pipe, record, taskEither } from '@code-expert/prelude';
import { HttpError, httpError } from './HttpError';
import { RequestBody, requestBody } from './RequestBody';
import { parseResponse } from './Response';

export interface HttpGetOptions<E, A> extends Omit<http.FetchOptions, 'method' | 'body'> {
  valueCodec: iots.Type<A, unknown>;
  errorCodec: iots.Type<E, unknown>;
  token?: string;
}

export interface HttpPostOptions<E, A> extends HttpGetOptions<E, A> {
  body?: RequestBody;
}

export const httpGet = <E, A>(
  url: string,
  options: HttpGetOptions<E, A>,
): taskEither.TaskEither<HttpError, either.Either<E, A>> =>
  fetch(url, { ...options, method: 'GET' });

export const httpPost = <E, A>(
  url: string,
  options: HttpPostOptions<E, A>,
): taskEither.TaskEither<HttpError, either.Either<E, A>> =>
  fetch(url, { ...options, method: 'POST' });

// -------------------------------------------------------------------------------------------------

interface FetchOptions<E, A> extends Omit<http.FetchOptions, 'body'> {
  valueCodec: iots.Type<A, unknown>;
  errorCodec: iots.Type<E, unknown>;
  token?: string;
  body?: RequestBody;
}

const fetch = <E, A>(
  url: string,
  { valueCodec, errorCodec, token, body, headers, ...fetchOptions }: FetchOptions<E, A>,
): taskEither.TaskEither<HttpError, either.Either<E, A>> => {
  const finalHeaders = {
    ...headers,
    ...(token != null ? { Authorization: `Bearer ${token}` } : {}),
    ...(body != null ? headersFromRequestBody(body) : {}),
  };
  const finalBody = body != null ? bodyFromRequestBody(body) : undefined;
  return pipe(
    taskEither.tryCatch(
      () => http.fetch(url, { headers: finalHeaders, body: finalBody, ...fetchOptions }),
      () =>
        // A fetch() promise only rejects when a network error is encountered
        // See https://developer.mozilla.org/en-US/docs/Web/API/fetch
        httpError.wide.noNetwork(),
    ),
    taskEither.chainEitherK(parseResponse({ valueCodec, errorCodec })),
  );
};

const headersFromRequestBody: (b: RequestBody) => Record<string, string> = requestBody.fold({
  json: () => ({ 'content-Type': 'application/json' }),
  binary: ({ type, encoding }) =>
    pipe(
      encoding,
      option.fold(constant({}), (e) => ({ 'Content-Encoding': e })),
      record.upsertAt('Content-Type', type),
    ),
});

const bodyFromRequestBody: (b: RequestBody) => http.Body = requestBody.fold({
  json: (j) => http.Body.json(j === null ? (j as $Unexpressable) : j), // Body.json claims it doesn't handle 'null', but does in fact accept it
  binary: ({ body }) => http.Body.bytes(body),
});
