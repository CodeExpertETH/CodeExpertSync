import { tagged } from '@code-expert/prelude';

export type HttpError =
  | tagged.Tagged<'noNetwork'>
  | tagged.Tagged<'clientError', { statusCode: number; message: string }>
  | tagged.Tagged<'serverError', { statusCode: number; message: string }>;

export const httpError = tagged.build<HttpError>();
