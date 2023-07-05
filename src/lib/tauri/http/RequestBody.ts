import { json, option, tagged } from '@code-expert/prelude';

export type RequestBody =
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
