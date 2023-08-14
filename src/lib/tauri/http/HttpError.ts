import { tagged } from '@code-expert/prelude';

export type HttpError =
  | tagged.Tagged<'noNetwork'>
  | tagged.Tagged<'unknownBodyType', Array<string>>;

export const httpError = tagged.build<HttpError>();
