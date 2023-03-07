import { theme as antdTheme } from 'antd';
import { nanoid } from 'nanoid/non-secure';
import React, {
  Attributes,
  CElement,
  ClassAttributes,
  ClassType,
  ClassicComponent,
  ClassicComponentClass,
  Component,
  ComponentClass,
  ComponentState,
  DOMAttributes,
  DOMElement,
  DetailedReactHTMLElement,
  FunctionComponent,
  FunctionComponentElement,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactElement,
  ReactHTML,
  ReactSVG,
  ReactSVGElement,
  SVGAttributes,
} from 'react';

import { CSSInterpolation, Keyframes, useStyleRegisterNoSSR } from '../../../lib/antd';
import { isObject } from '../../../utils/fn';
import { Theme, useTheme } from './theme';
import {
  CSSWithVariants,
  ExtractVariantProps,
  classListFromProps,
  rulesFromStyles,
  separateVariantProps,
} from './variants';

// -------------------------------------------------------------------------------------------------
// Styled

export type GetStyles<C extends CSSWithVariants> = (theme: Theme) => C;

export function styled<C extends CSSWithVariants>(
  type: 'input',
  styles: GetStyles<C>,
): React.ForwardRefExoticComponent<
  | ((InputHTMLAttributes<HTMLInputElement> & ClassAttributes<HTMLInputElement>) &
      ExtractVariantProps<C>)
  | (null &
      React.RefAttributes<
        DetailedReactHTMLElement<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
      >)
>;
export function styled<
  P extends HTMLAttributes<T>,
  T extends HTMLElement,
  C extends CSSWithVariants,
>(
  type: keyof ReactHTML,
  styles: GetStyles<C>,
): React.ForwardRefExoticComponent<
  | (ClassAttributes<T> & P & ExtractVariantProps<C>)
  | (null & React.RefAttributes<DetailedReactHTMLElement<P, T>>)
>;
export function styled<P extends SVGAttributes<T>, T extends SVGElement, C extends CSSWithVariants>(
  type: keyof ReactSVG,
  styles: GetStyles<C>,
): React.ForwardRefExoticComponent<
  (ClassAttributes<T> & P & ExtractVariantProps<C>) | (null & React.RefAttributes<ReactSVGElement>)
>;
export function styled<P extends DOMAttributes<T>, T extends Element, C extends CSSWithVariants>(
  type: string,
  styles: GetStyles<C>,
): React.ForwardRefExoticComponent<
  (ClassAttributes<T> & P & ExtractVariantProps<C>) | (null & React.RefAttributes<DOMElement<P, T>>)
>;
// eslint-disable-next-line @typescript-eslint/ban-types
export function styled<P extends {}, C extends CSSWithVariants>(
  type: FunctionComponent<P>,
  styles: GetStyles<C>,
): React.ForwardRefExoticComponent<
  | (Attributes & P & ExtractVariantProps<C>)
  | (null & React.RefAttributes<FunctionComponentElement<P>>)
>;
// eslint-disable-next-line @typescript-eslint/ban-types
export function styled<P extends {}, C extends CSSWithVariants>(
  type: ClassType<P, ClassicComponent<P, ComponentState>, ClassicComponentClass<P>>,
  styles: GetStyles<C>,
): React.ForwardRefExoticComponent<
  | (ClassAttributes<ClassicComponent<P, ComponentState>> & P & ExtractVariantProps<C>)
  | (null & React.RefAttributes<CElement<P, ClassicComponent<P, ComponentState>>>)
>;
export function styled<
  // eslint-disable-next-line @typescript-eslint/ban-types
  P extends {},
  T extends Component<P, ComponentState>,
  R extends ComponentClass<P>,
  C extends CSSWithVariants,
>(
  type: ClassType<P, T, R>,
  styles: GetStyles<C>,
): React.ForwardRefExoticComponent<
  (ClassAttributes<T> & P & ExtractVariantProps<C>) | (null & React.RefAttributes<CElement<P, T>>)
>;
// eslint-disable-next-line @typescript-eslint/ban-types
export function styled<P extends {}, C extends CSSWithVariants>(
  type: FunctionComponent<P> | ComponentClass<P> | string,
  styles: GetStyles<C>,
): React.ForwardRefExoticComponent<
  (Attributes & P & ExtractVariantProps<C>) | (null & React.RefAttributes<ReactElement<P>>)
>;

/**
 * This is an implementation of the "styled" API for @ant-design/cssinjs. It's based on the API
 * spearheaded by styled-components and similar.
 *
 * The type overloads mimick {@link React.createElement} in order to provide
 * proper typings for named elements.
 */
export function styled(
  Element: $Unexpressable,
  getStyles: GetStyles<$Unexpressable>,
): React.ForwardRefExoticComponent<
  $Unexpressable & ExtractVariantProps<$Unexpressable> & React.RefAttributes<unknown>
> {
  const displayName =
    isObject(Element) && typeof Element['displayName'] === 'string' && Element['displayName'] !== ''
      ? Element['displayName']
      : 'Unnamed';
  const namespace = `${displayName}-${nanoid(8)}`;

  const Component = React.forwardRef(({ className, ...overloadedProps }: $Unexpressable, ref) => {
    const appTheme = useTheme();
    const { theme, token, hashId } = antdTheme.useToken();
    const { styles, animations } = parseStyles(getStyles(appTheme));
    const { props, variantClassList } = separateVariantProps(styles, overloadedProps);
    const scopedClassNames = useStyleRegisterNoSSR(
      { theme, token, hashId, path: [namespace] },
      () =>
        new Array<CSSInterpolation>()
          .concat(styles)
          .map(rulesFromStyles(namespace))
          .concat(animations),
    );
    return React.createElement(Element, {
      ...props,
      className: [className, scopedClassNames, ...variantClassList].filter(Boolean).join(' '),
      ref,
    });
  });
  Component.displayName = `styled.${displayName}`;

  return Component;
}

// -------------------------------------------------------------------------------------------------
// CSS

export const css: <C extends CSSWithVariants>(
  _: GetStyles<C>,
) => (props?: ExtractVariantProps<C>) => string = (getStyles) => {
  const namespace = `css-${nanoid(8)}`;
  return function useCss(props): string {
    const appTheme = useTheme();
    const { theme, token, hashId } = antdTheme.useToken();
    const { styles, animations } = parseStyles(getStyles(appTheme));
    const baseClasses = useStyleRegisterNoSSR({ theme, token, hashId, path: [namespace] }, () =>
      new Array<CSSInterpolation>()
        .concat(styles)
        .map(rulesFromStyles(namespace))
        .concat(animations),
    );
    return [baseClasses, ...classListFromProps(props ?? {})].join(' ');
  };
};

// -------------------------------------------------------------------------------------------------
// Keyframes

export const keyframes = (styles: CSSInterpolation) => {
  const namespace = `keyframe-${nanoid(8)}`;
  return new Keyframes(namespace, styles);
};

// -------------------------------------------------------------------------------------------------
// Utils

const parseStyles = (
  styles: CSSInterpolation,
): { styles: CSSInterpolation; animations: Array<Keyframes> } =>
  styles != null && Array.isArray(styles)
    ? {
        styles: styles.filter(
          (x: unknown): x is CSSInterpolation =>
            !isObject(x) || !('_keyframe' in x && x['_keyframe'] === true),
        ),
        animations: styles.filter(
          (x: unknown): x is Keyframes =>
            isObject(x) && '_keyframe' in x && x['_keyframe'] === true,
        ),
      }
    : { styles, animations: [] };
