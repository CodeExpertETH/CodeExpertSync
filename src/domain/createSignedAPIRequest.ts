import { either, flow, iots, option, pipe, task } from '@code-expert/prelude';
import { ResponseType, fetch } from '@tauri-apps/api/http';
import { api } from 'api';
import { createSigner } from 'fast-jwt';

import { digestMessage } from '../utils/crypto';
import { AppId } from './AppId';
import { EntityNotFoundException, fromError, invalid } from './exception';

const buildSigner = (
  privateKey: string,
  appId: string,
): ((payload: string | Buffer | { [p: string]: unknown }) => string) =>
  createSigner({
    algorithm: 'EdDSA',
    key: privateKey,
    expiresIn: 10000, //10sec
    iss: digestMessage(appId),
  });

export const createSignedAPIRequest = async <P extends object | undefined>({
  payload,
  method,
  path,
  codec,
}: {
  payload: Record<string, unknown>;
  method: 'GET' | 'POST';
  path: string;
  codec: iots.Decoder<iots.Mixed, P>;
}): Promise<P> => {
  const privateKey = await pipe(
    api.settingRead('privateKey', iots.string),
    task.map(
      option.getOrThrow(
        () =>
          new EntityNotFoundException(
            {},
            'No privateKey was found. Please contact the developers.',
          ),
      ),
    ),
    task.map((key) => key as string),
    task.run,
  );
  const appIdentifier = await pipe(
    api.settingRead('appId', AppId),
    task.map(
      option.getOrThrow(
        () =>
          new EntityNotFoundException({}, 'No app id was found. Please contact the developers.'),
      ),
    ),
    task.run,
  );

  // TODO run this on rust as fast-jwt is not available in tauri
  const token = buildSigner(privateKey, appIdentifier)(payload);

  return fetch(new URL(path, api.APIUrl).href, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: ResponseType.JSON,
  }).then((res) => {
    if (!res.ok) {
      throw Error('Error during response');
    }
    return pipe(
      res.data as $IntentionalAny,
      codec.decode,
      either.mapLeft(flow(iots.formatValidationErrors, invalid)),
      either.getOrThrow(fromError),
    );
  });
};
