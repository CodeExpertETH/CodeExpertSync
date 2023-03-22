import { either, flow, iots, pipe } from '@code-expert/prelude';
import { Body, ResponseType, fetch } from '@tauri-apps/api/http';
import { api } from 'api';

import { fromError, invalid } from './exception';

export const createAPIRequest = <P extends object | undefined>({
  payload,
  method,
  path,
  codec,
}: {
  payload: Record<string, unknown>;
  method: 'GET' | 'POST';
  path: string;
  codec: iots.Decoder<iots.Mixed, P>;
}): Promise<P> =>
  fetch(new URL(path, api.APIUrl).href, {
    method,
    body: Body.json(payload),
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
