import { $Unexpressable } from '@code-expert/type-utils';
import * as http from '@tauri-apps/api/http';
import { constant, iots, option, pipe, record, taskEither } from '@code-expert/prelude';
import { HttpError, httpError } from './HttpError';
import { RequestBody, requestBody } from './RequestBody';
import { parseResponse } from './Response';

export interface HttpGetOptions<A> extends Omit<http.FetchOptions, 'method' | 'body'> {
  codec: iots.Decoder<unknown, A>;
  token?: string;
}

export interface HttpPostOptions<A> extends HttpGetOptions<A> {
  body?: RequestBody;
}

export const httpGet = <A>(
  url: string,
  options: HttpGetOptions<A>,
): taskEither.TaskEither<HttpError, A> => fetch(url, { ...options, method: 'GET' });

export const httpPost = <A>(
  url: string,
  options: HttpPostOptions<A>,
): taskEither.TaskEither<HttpError, A> => fetch(url, { ...options, method: 'POST' });

// -------------------------------------------------------------------------------------------------

interface FetchOptions<A> extends Omit<http.FetchOptions, 'body'> {
  codec: iots.Decoder<unknown, A>;
  token?: string;
  body?: RequestBody;
}

const fetch = <A>(
  url: string,
  { codec, token, body, headers: headers_, ...fetchOptions }: FetchOptions<A>,
): taskEither.TaskEither<HttpError, A> => {
  const finalHeaders = {
    ...headers_,
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
    taskEither.chainEitherK(parseResponse(codec)),
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
