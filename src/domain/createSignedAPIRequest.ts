import { either, flow, iots, pipe, taskEither } from '@code-expert/prelude';
import { ResponseType, fetch } from '@tauri-apps/api/http';
import { api } from 'api';

import { digestMessage } from '../utils/crypto';
import { AppId } from './AppId';
import { EntityNotFoundException, fromError, invalid } from './exception';

function createToken(payload: Record<string, unknown>) {
  return (appId: AppId) =>
    taskEither.tryCatch(
      () =>
        api.create_jwt_tokens({
          ...payload,
          iss: digestMessage(appId),
          exp: Math.floor(Date.now() / 1000) + 10,
        }),
      fromError,
    );
}

function sendApiRequest(path: string, method: 'GET' | 'POST') {
  return (token: string) =>
    taskEither.tryCatch(
      () =>
        fetch(new URL(path, api.APIUrl).href, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: ResponseType.JSON,
        }),
      fromError,
    );
}

export const createSignedAPIRequest = <P extends object | undefined>({
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
    api.settingRead('appId', AppId),
    taskEither.fromTaskOption(
      () => new EntityNotFoundException({}, 'No app id was found. Please contact the developers.'),
    ),
    taskEither.chain(createToken(payload)),
    taskEither.chain(sendApiRequest(path, method)),
    taskEither.chain((res) => {
      if (!res.ok) {
        return taskEither.left(
          new Error(`Response error: ${(res?.data as { message: string })?.message ?? 'unknown'}`),
        );
      }
      return taskEither.right(res);
    }),
    taskEither.map(({ data }) =>
      pipe(
        data,
        codec.decode,
        either.mapLeft(flow(iots.formatValidationErrors, invalid)),
        either.getOrThrow(fromError),
      ),
    ),
  );
