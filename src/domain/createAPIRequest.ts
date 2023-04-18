import { either, flow, iots, pipe, taskEither } from '@code-expert/prelude';
import { Body, Response, ResponseType, fetch } from '@tauri-apps/api/http';
import { api } from 'api';

import { ClientId } from './ClientId';
import { EntityNotFoundException, fromError, invalid } from './exception';

export function createTokenWithClientId(payload: Record<string, unknown>) {
  return (clientId: ClientId) =>
    taskEither.tryCatch(
      () =>
        api.create_jwt_tokens({
          ...payload,
          iss: clientId,
          exp: Math.floor(Date.now() / 1000) + 10,
        }),
      fromError,
    );
}

function sendApiRequest(path: string, method: 'GET' | 'POST', responseType: ResponseType) {
  return (token: string) =>
    taskEither.tryCatch(
      () =>
        fetch(new URL(path, api.APIUrl).href, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType,
        }),
      fromError,
    );
}

function sendApiRequestPayload(path: string, method: 'GET' | 'POST') {
  return (payload: Record<string, unknown>) =>
    taskEither.tryCatch(
      () =>
        fetch(new URL(path, api.APIUrl).href, {
          method,
          body: Body.json(payload),
          responseType: ResponseType.JSON,
        }),
      fromError,
    );
}

function parseResponse() {
  return (res: Response<unknown>) => {
    if (!res.ok) {
      return taskEither.left(
        new Error(`Response error: ${(res?.data as { message: string })?.message ?? 'unknown'}`),
      );
    }
    return taskEither.right(res);
  };
}

function decodeResponse<P>(codec: iots.Decoder<unknown, P>) {
  return ({ data }: Response<unknown>) =>
    pipe(
      data,
      codec.decode,
      either.mapLeft(flow(iots.formatValidationErrors, invalid)),
      either.getOrThrow(fromError),
    );
}

export const createToken = (payload: Record<string, unknown>) =>
  pipe(
    api.settingRead('clientId', ClientId),
    taskEither.fromTaskOption(
      () =>
        new EntityNotFoundException({}, 'No client id was found. Please contact the developers.'),
    ),
    taskEither.chain(createTokenWithClientId(payload)),
  );

export const createSignedAPIRequest = <P>({
  payload,
  method,
  path,
  codec,
  responseType = ResponseType.JSON,
}: {
  payload: Record<string, unknown>;
  method: 'GET' | 'POST';
  path: string;
  codec: iots.Decoder<unknown, P>;
  responseType?: ResponseType;
}): taskEither.TaskEither<Error, P> =>
  pipe(
    createToken(payload),
    taskEither.chain(sendApiRequest(path, method, responseType)),
    taskEither.chain(parseResponse()),
    taskEither.map(decodeResponse(codec)),
  );

export const createAPIRequest = <P extends object | undefined>({
  payload,
  method,
  path,
  codec,
}: {
  payload: Record<string, unknown>;
  method: 'GET' | 'POST';
  path: string;
  codec: iots.Decoder<unknown, P>;
}): taskEither.TaskEither<Error, P> =>
  pipe(
    payload,
    sendApiRequestPayload(path, method),
    taskEither.chain(parseResponse()),
    taskEither.map(decodeResponse(codec)),
  );
