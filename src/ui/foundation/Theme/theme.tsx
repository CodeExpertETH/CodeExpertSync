import { ConfigProvider, theme } from 'antd';
import { ThemeConfig } from 'antd/es/config-provider/context';
import { AliasToken, ColorPalettes } from 'antd/es/theme/interface';
import { PresetColors } from 'antd/es/theme/internal';
import formatToken from 'antd/es/theme/util/alias';
import React from 'react';

import { record } from '../../../prelude';
import { omit } from '../../../utils/fn';
import { ColorScheme, isLight } from './colorScheme';

type PresetColorTokens = { [K in (typeof PresetColors)[number]]: null };
const presetColorTokens: PresetColorTokens = PresetColors.reduce(
  (acc, name) => ((acc[name] = null), acc),
  {} as PresetColorTokens,
);

/**
 * Antd asks us not to use some of these directly. Others we don't want to expose.
 */
export const internalTokenKeys = {
  ...presetColorTokens,
  _hashId: null,
  _tokenKey: null,
  boxShadowPopoverArrow: null,
  boxShadowCard: null,
  boxShadowDrawerRight: null,
  boxShadowDrawerLeft: null,
  boxShadowDrawerUp: null,
  boxShadowDrawerDown: null,
  boxShadowTabsOverflowLeft: null,
  boxShadowTabsOverflowRight: null,
  boxShadowTabsOverflowTop: null,
  boxShadowTabsOverflowBottom: null,
  colorBgBase: null,
  colorTextBase: null,
  motionBase: null,
  wireframe: null,
};

export type InternalTokenKeys = keyof typeof internalTokenKeys;

// Not all keys on Antd's AliasToken should be exposed; this represents the subset of keys we want.
type FilteredAliasToken = Omit<AliasToken, InternalTokenKeys>;

// -------------------------------------------------------------------------------------------------

export interface DesignTokens extends FilteredAliasToken {
  colorIdeBg: string;
  colorIdeBgButton: string;
  colorIdeBgButtonHover: string;
  colorIdeButtonText: string;
  colorIdeButtonTextHover: string;
  colorIdeEditorBg: string;
  colorIdeText: string;
  colorIdeSelection: string;
  colorMarkdownBg: string;
  colorMarkdownText: string;
  colorMarkdownBorder: string;
  fontSizeXS: string;
  linkDecoration: string;
  linkHoverDecoration: string;
  linkFocusDecoration: string;
}

const deriveDesignTokens = (scheme: ColorScheme, tokens: AliasToken): DesignTokens => {
  // Filter out internal keys that should not appear in the types and documentation. This is a bit
  // of a hackery because the values are in the record but not exposed on the type level.
  const filteredTokens = omit(
    tokens as $Unexpressable,
    record.keys(internalTokenKeys),
  ) as FilteredAliasToken;

  return {
    ...filteredTokens,
    colorIdeBg: isLight(scheme) ? '#f0f0f0' : '#22231d',
    colorIdeBgButton: isLight(scheme) ? '#ffffff' : '#8c8c8c',
    colorIdeBgButtonHover: isLight(scheme) ? '#ffffff' : '#595959',
    colorIdeButtonText: isLight(scheme) ? '#22231d' : '#d2d2d2',
    colorIdeButtonTextHover: isLight(scheme) ? tokens.colorPrimary : '#ffffff',
    colorIdeEditorBg: isLight(scheme) ? '#ffffff' : '#272822',
    colorIdeText: isLight(scheme) ? '#22231d' : '#d2d2d2',
    colorIdeSelection: isLight(scheme) ? tokens.colorPrimaryBgHover : '#4a4a40',
    colorMarkdownBg: isLight(scheme) ? '#ffffff' : '#e7e8e1',
    colorMarkdownText: 'rgba(0, 0, 0, 0.88)',
    colorMarkdownBorder: 'rgba(0, 0, 0, 0.15)',
    fontSizeXS: '10px',
    linkDecoration: tokens.linkDecoration as unknown as string,
    linkHoverDecoration: tokens.linkHoverDecoration as unknown as string,
    linkFocusDecoration: tokens.linkFocusDecoration as unknown as string,
  };
};

const themeConfig = (colorScheme: ColorScheme): ThemeConfig => ({
  algorithm: isLight(colorScheme) ? theme.defaultAlgorithm : theme.darkAlgorithm,
  token: {
    fontFamily: '"Open Sans", sans-serif',
  },
});

// -------------------------------------------------------------------------------------------------

type StartsWith<A extends string, P extends string> = A extends `${P}${string}` ? A : never;

export type ColorTokens = {
  [K in keyof ColorPalettes | StartsWith<keyof DesignTokens, 'color'>]: DesignTokens[K];
};

// -------------------------------------------------------------------------------------------------

export interface Theme {
  colorScheme: ColorScheme;
  tokens: DesignTokens;
}

const defaultTokens = theme.defaultAlgorithm(theme.defaultConfig.token);

const ThemeContext = React.createContext<Theme>({
  colorScheme: 'light',
  tokens: deriveDesignTokens('light', formatToken({ ...defaultTokens, override: {} })),
});

const DerivedThemeContext = ({
  colorScheme,
  children,
}: React.PropsWithChildren<{ colorScheme: ColorScheme }>) => {
  const tokens = deriveDesignTokens(colorScheme, theme.useToken().token);
  return <ThemeContext.Provider value={{ colorScheme, tokens }}>{children}</ThemeContext.Provider>;
};

export const ThemeProvider = React.memo<{
  children?: React.ReactNode;
  colorScheme?: ColorScheme;
}>(function ThemeProvider({ children, colorScheme = 'light' }) {
  return (
    <ConfigProvider theme={themeConfig(colorScheme)}>
      <DerivedThemeContext colorScheme={colorScheme}>{children}</DerivedThemeContext>
    </ConfigProvider>
  );
});

export const useTheme = (): Theme => React.useContext(ThemeContext);
