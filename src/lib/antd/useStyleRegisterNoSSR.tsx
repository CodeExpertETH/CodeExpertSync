// eslint-disable-next-line import/no-extraneous-dependencies
import { Theme } from '@ant-design/cssinjs';
import StyleContext, {
  ATTR_MARK,
  ATTR_TOKEN,
  CSS_IN_JS_INSTANCE,
} from '@ant-design/cssinjs/es/StyleContext';
import useGlobalCache from '@ant-design/cssinjs/es/hooks/useGlobalCache';
import {
  CSSInterpolation,
  normalizeStyle,
  parseStyle,
} from '@ant-design/cssinjs/es/hooks/useStyleRegister';
import { $FixMe, $IntentionalAny } from '@code-expert/type-utils';
import hash from '@emotion/hash';
import { MapToken, SeedToken } from 'antd/es/theme/interface';
// eslint-disable-next-line import/no-extraneous-dependencies
// eslint-disable-next-line import/no-extraneous-dependencies
import { removeCSS, updateCSS } from 'rc-util/lib/Dom/dynamicCSS';
import React from 'react';

function uniqueHash(path: (string | number)[], styleStr: string) {
  return hash(`${path.join('%')}${styleStr}`);
}

// Global effect style will mount once and not removed
// The effect will not save in SSR cache (e.g. keyframes)
const globalEffectStyleKeys = new Set();

/**
 * This is our own implementation of Antd's `useStyleRegister` function.
 *
 * It is targeted towards application styles, not component styles like theirs.
 *
 * Because it relies on a lot of cssinjs internals, this is likely to break with updates and we
 * must take extra care to keep it in sync.
 *
 * Fixes:
 * - FIX #1: Return class names instead of config data (this breaks SSR, but we don't use that).
 * - FIX #2: Always append styles to `body` in order to receive higher specificity than Antd
 *
 * @internal Do not use directly in components.
 * @returns A class name instead of internal data
 */
export function useStyleRegisterNoSSR(
  info: {
    theme: Theme<SeedToken, MapToken>;
    token: $IntentionalAny;
    path: string[];
    hashId?: string;
    layer?: string;
  },
  styleFn: () => CSSInterpolation,
): string {
  const { token, path, hashId, layer } = info;
  const { autoClear, hashPriority, /* FIX #2 container, */ transformers, linters } =
    React.useContext(StyleContext);
  const container = document.body; // FIX #2
  const tokenKey = token._tokenKey as string;

  const fullPath = [tokenKey, ...path];

  // Check if need insert style
  const isMergedClientSide = true;

  useGlobalCache(
    'style',
    fullPath,
    // Create cache if needed
    () => {
      const styleObj = styleFn();
      const [parsedStyle, effectStyle] = parseStyle(styleObj, {
        hashId,
        hashPriority,
        layer,
        path: path.join('-'),
        transformers,
        linters,
      });
      const styleStr = normalizeStyle(parsedStyle);
      const styleId = uniqueHash(fullPath, styleStr);

      if (isMergedClientSide) {
        const style = updateCSS(styleStr, styleId, {
          mark: ATTR_MARK,
          prepend: 'queue',
          attachTo: container as $FixMe,
        });

        (style as $IntentionalAny)[CSS_IN_JS_INSTANCE] = CSS_IN_JS_INSTANCE;

        // Used for `useCacheToken` to remove on batch when token removed
        style.setAttribute(ATTR_TOKEN, tokenKey);

        // Inject client side effect style
        Object.keys(effectStyle).forEach((effectKey) => {
          if (!globalEffectStyleKeys.has(effectKey)) {
            globalEffectStyleKeys.add(effectKey);

            // Inject
            updateCSS(normalizeStyle(effectStyle[effectKey]), `_effect-${effectKey}`, {
              mark: ATTR_MARK,
              prepend: 'queue',
              attachTo: container as $FixMe,
            });
          }
        });
      }

      return [styleStr, tokenKey, styleId];
    },
    // Remove cache if no need
    ([, , styleId], fromHMR) => {
      if (fromHMR || autoClear) {
        removeCSS(styleId, { mark: ATTR_MARK });
      }
    },
  );

  return [hashId, ...path].filter(Boolean).join(' '); // FIX #1
}
