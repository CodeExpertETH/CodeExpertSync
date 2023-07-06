import { iots, pipe, taskEither } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { invariantViolated } from '@/domain/exception';
import { apiPost, requestBody } from '@/utils/api';

const codec = iots.null;

export const getAccess = (
  clientId: ClientId,
  code_verifier: string,
  authToken: string,
  pubKey: string,
) => {
  const body = requestBody.json({
    clientId,
    authToken,
    code_verifier,
    pubKey,
  });

  return pipe(
    apiPost({ path: 'app/oauth/gainAccess', body, codec }),
    taskEither.mapLeft((e) => invariantViolated(e._tag)),
  );
};
