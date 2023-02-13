import { adt } from '../../../prelude';

export const foldColorScheme = adt.foldFromKeys({
  light: null,
  dark: null,
});

export type ColorScheme = adt.TypeOfKeys<typeof foldColorScheme>;

export const isLight = (colorScheme: ColorScheme) => colorScheme === 'light';

export const toggleColorScheme = (previousScheme: ColorScheme) =>
  isLight(previousScheme) ? 'dark' : 'light';
