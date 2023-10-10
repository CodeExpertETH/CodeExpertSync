import { either, identity, iots, pipe } from '@code-expert/prelude';

interface UrlBrand {
  readonly Url: unique symbol;
}

const Url = iots.brand(
  iots.string,
  (s): s is iots.Branded<string, UrlBrand> => iots.string.is(s) && s.length > 0,
  'Url',
);

const Config = iots.type({
  CX_WEB_URL: Url,
  CX_API_URL: Url,
  CX_REPO_RELEASE: Url,
  GITHUB_SHA: iots.union([iots.string, iots.undefined]),
  APP_SIGNAL_KEY: iots.union([iots.string, iots.undefined]),
  APP_SIGNAL_REVISION: iots.union([iots.string, iots.undefined]),
});

export type Config = iots.TypeOf<typeof Config>;

export const config: Config = pipe(
  process.env,
  Config.decode,
  either.fold((errors) => {
    throw new Error(
      'Parsing environment variables failed. Did you create a .env file in the root directory?\n\n' +
        iots.formatValidationErrors(errors).join('\n'),
    );
  }, identity),
);
