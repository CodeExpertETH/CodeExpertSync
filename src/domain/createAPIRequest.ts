import { $Unexpressable } from '@code-expert/type-utils';
import { Body, Response, ResponseType, fetch } from '@tauri-apps/api/http';
import { api } from 'api';
import {
  constUndefined,
  constant,
  either,
  flow,
  iots,
  json,
  option,
  pipe,
  record,
  tagged,
  taskEither,
} from '@code-expert/prelude';
import { config } from '@/config';
import { ClientId } from './ClientId';
import {
  EntityNotFoundException,
  Exception,
  fromError,
  invalid,
  invariantViolated,
} from './exception';

type RequestBody =
  | tagged.Tagged<'json', json.Json>
  | tagged.Tagged<
      'binary',
      {
        body: ArrayBuffer;
        type: string;
        encoding: option.Option<string>;
      }
    >;

export const requestBody = tagged.build<RequestBody>();

const constEmpty = constant({});

const toHeaders: (b: RequestBody) => Record<string, string> = requestBody.fold({
  json: () => ({ 'content-Type': 'application/json' }),
  binary: ({ type, encoding }) =>
    pipe(
      encoding,
      option.fold(constEmpty, (e) => ({ 'Content-Encoding': e })),
      record.upsertAt('Content-Type', type),
    ),
});

const toBody: (b: RequestBody) => Body = requestBody.fold({
  json: (j) => Body.json(j as $Unexpressable), // fixme: tauri types say Body.json doesn't accept 'null', check what happens in that case
  binary: ({ body }) => Body.bytes(body),
});

export function createTokenWithClientId(payload: Record<string, unknown>) {
  return (clientId: ClientId) =>
    api.create_jwt_tokens({
      ...payload,
      iss: clientId,
      exp: Math.floor(Date.now() / 1000) + 10,
    });
}

function sendApiRequest(
  method: 'GET' | 'POST',
  path: string,
  body: option.Option<RequestBody>,
  responseType: ResponseType,
) {
  return (token: string) =>
    taskEither.tryCatch(
      () =>
        fetch(new URL(path, config.CX_API_URL).href, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            ...pipe(body, option.fold(constEmpty, toHeaders)),
          },
          body: pipe(body, option.fold(constUndefined, toBody)),
          responseType,
        }),
      fromError,
    );
}

function sendApiRequestPayload(
  path: string,
  method: 'GET' | 'POST',
  body: option.Option<RequestBody>,
) {
  return taskEither.tryCatch(
    () =>
      fetch(new URL(path, config.CX_API_URL).href, {
        method,
        headers: {
          ...pipe(body, option.fold(constEmpty, toHeaders)),
        },
        body: pipe(body, option.fold(constUndefined, toBody)),
        responseType: ResponseType.JSON,
      }),
    fromError,
  );
}

const ErrorResponseC = iots.strict({
  statusCode: iots.number,
  error: iots.string,
  message: iots.string,
});

const parseResponse: (response: Response<unknown>) => either.Either<Exception, unknown> = flow(
  either.fromPredicate(
    (r) => r.ok,
    (r) => r.data,
  ),
  either.bimap(
    flow(
      ErrorResponseC.decode,
      either.fold(
        () => 'Unknown',
        (data) => data.message,
      ),
      (message) => `Response error: ${message}`,
      invariantViolated,
    ),
    (r) => r.data,
  ),
);

const decodeResponse = <P>(
  codec: iots.Decoder<unknown, P>,
): ((data: unknown) => either.Either<Exception, P>) =>
  flow(codec.decode, either.mapLeft(flow(iots.formatValidationErrors, invalid)));

export const createToken = (payload: Record<string, unknown>) =>
  pipe(
    api.settingRead('clientId', ClientId),
    taskEither.fromTaskOption(
      () =>
        new EntityNotFoundException({}, 'No client id was found. Please contact the developers.'),
    ),
    taskEither.chain(createTokenWithClientId(payload)),
  );

export function createSignedAPIRequest<R>(options: {
  method: 'GET';
  path: string;
  jwtPayload: Record<string, unknown>;
  responseType?: ResponseType;
  codec: iots.Decoder<unknown, R>;
}): taskEither.TaskEither<Exception, R>;
export function createSignedAPIRequest<R>(options: {
  method: 'POST';
  path: string;
  jwtPayload: Record<string, unknown>;
  body?: RequestBody;
  responseType?: ResponseType;
  codec: iots.Decoder<unknown, R>;
}): taskEither.TaskEither<Exception, R>;
export function createSignedAPIRequest<R>({
  method,
  path,
  jwtPayload,
  body,
  responseType = ResponseType.JSON,
  codec,
}: {
  method: 'GET' | 'POST';
  path: string;
  jwtPayload: Record<string, unknown>;
  body?: RequestBody;
  responseType?: ResponseType;
  codec: iots.Decoder<unknown, R>;
}): taskEither.TaskEither<Exception, R> {
  return pipe(
    createToken(jwtPayload),
    taskEither.chain(sendApiRequest(method, path, option.fromNullable(body), responseType)),
    taskEither.chainEitherK(parseResponse),
    taskEither.chainEitherK(decodeResponse(codec)),
  );
}

export function createAPIRequest<R>(options: {
  method: 'GET';
  path: string;
  codec: iots.Decoder<unknown, R>;
}): taskEither.TaskEither<Exception, R>;
export function createAPIRequest<R>(options: {
  method: 'POST';
  path: string;
  body?: RequestBody;
  codec: iots.Decoder<unknown, R>;
}): taskEither.TaskEither<Exception, R>;
export function createAPIRequest<R>({
  method,
  path,
  body,
  codec,
}: {
  method: 'GET' | 'POST';
  path: string;
  body?: RequestBody;
  codec: iots.Decoder<unknown, R>;
}): taskEither.TaskEither<Exception, R> {
  return pipe(
    sendApiRequestPayload(path, method, option.fromNullable(body)),
    taskEither.chainEitherK(parseResponse),
    taskEither.chainEitherK(decodeResponse(codec)),
  );
}
