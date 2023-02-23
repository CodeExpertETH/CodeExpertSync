import React from 'react';

import { DesignTokens, css, useTheme } from '../Theme';

type CSSPercentage = '%';

type CSSAbsoluteLength = 'cm' | 'mm' | 'Q' | 'in' | 'pc' | 'pt' | 'px';

type CSSRelativeLength =
  | 'em'
  | 'ex'
  | 'ch'
  | 'rem'
  | 'lh'
  | 'rlh'
  | 'vw'
  | 'vh'
  | 'vmin'
  | 'vmax'
  | 'vb'
  | 'vi'
  | 'svw'
  | 'svh'
  | 'lvw'
  | 'lvh'
  | 'dvw'
  | 'dvh';

export type CSSUnit = CSSPercentage | CSSAbsoluteLength | CSSRelativeLength;

export type CSSSize = `${number}${CSSUnit}`;

export type Size = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export const sizeToNumber =
  (tokens: DesignTokens, prop: 'margin' | 'padding' | 'size') =>
  (size?: Size | CSSSize | number | boolean): number | undefined =>
    size != null
      ? typeof size === 'boolean'
        ? (tokens as $FixMe)[`${prop}`]
        : typeof size === 'number'
        ? size
        : (tokens as $FixMe)[`${prop}${size.toUpperCase()}`] ?? size
      : undefined;

/**
 * - "m" is margin
 * - "p" is padding
 */
export type Area = 'm' | 'p';

const areas = ['m', 'p'];

/**
 * - "a" is all sides
 * - "v" is top and bottom (vertical)
 * - "h" is left and right (horizontal)
 * - "t" is top
 * - "r" is right
 * - "b" is bottom
 * - "l" is left
 */
export type Side = 'a' | 'v' | 'h' | 't' | 'r' | 'b' | 'l';

const sides = ['a', 'v', 'h', 't', 'r', 'b', 'l'];

export type BoxArea = `${Area}${Side}`;

/**
 * The combination of {@link Area} and {@link Side}.
 *
 * @example
 * - "mt" is margin-top
 * - "ph" is padding-horizontal (padding-left and padding-right)
 */
export type BoxAreaDefinition = {
  [K in BoxArea]?: Size | CSSSize | number | boolean;
};

// -------------------------------------------------------------------------------------------------

export type Justify =
  | 'start'
  | 'end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

export type Align = 'start' | 'end' | 'center' | 'baseline' | 'stretch';

const justifyMap = {
  start: 'flex-start',
  end: 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  center: 'center',
  'space-evenly': 'space-evenly',
};

const alignMap = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  baseline: 'baseline',
  stretch: 'stretch',
};

export const justifyContent = (justify: Justify = 'start') => justifyMap[justify];

export const alignItems = (align: Align = 'stretch') => alignMap[align];

// -------------------------------------------------------------------------------------------------

const useStyledSystemStyles = css(() => ({
  position: 'relative',
  variants: {
    display: {
      block: {
        display: 'block',
      },
      flexRow: {
        display: 'flex',
        flexDirection: 'row',
      },
      flexColumn: {
        display: 'flex',
        flexDirection: 'column',
      },
      grid: {
        display: 'grid',
      },
    },
    ellipsis: {
      true: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    },
    fill: {
      true: {
        flex: 1,
        overflowBlock: 'auto',
      },
    },
    inline: {
      true: {
        width: 'fit-content',
        alignSelf: 'flex-start',
      },
    },
    marginTrim: {
      block: {
        '& > :first-child': {
          marginTop: '0 !important',
        },
        '& > :last-child': {
          marginBottom: '0 !important',
        },
      },
    },
  },
}));

export type StyledSystemProp = BoxAreaDefinition & Parameters<typeof useStyledSystemStyles>[0];

const styledSystemProps = new Set([
  'display',
  'ellipsis',
  'fill',
  'inline',
  'marginTrim',
  ...areas.flatMap((a) => sides.map((s) => `${a}${s}`)),
]);

export const isStyledSystemProperty = (x: string): boolean => styledSystemProps.has(x);

export const useStyledSystem = <A>({
  className,
  style,
  display,
  ellipsis = false,
  marginTrim,
  fill = false,
  inline = false,
  ma,
  mv,
  mh,
  mt,
  mr,
  mb,
  ml,
  pa,
  pv,
  ph,
  pt,
  pr,
  pb,
  pl,
  ...rest
}: A & {
  className?: string;
  style?: React.CSSProperties;
} & StyledSystemProp) => {
  const { tokens } = useTheme();
  const toMargin = sizeToNumber(tokens, 'margin');
  const toPadding = sizeToNumber(tokens, 'padding');
  const styledClassName = useStyledSystemStyles({
    display,
    ellipsis,
    fill,
    inline,
    marginTrim,
  });

  console.assert(
    !Object.keys(rest).some(isStyledSystemProperty),
    'Not all styled system properties are handled.',
  );

  return {
    style: {
      marginTop: toMargin(mt ?? mv ?? ma),
      marginRight: toMargin(mr ?? mh ?? ma),
      marginBottom: toMargin(mb ?? mv ?? ma),
      marginLeft: toMargin(ml ?? mh ?? ma),
      paddingTop: toPadding(pt ?? pv ?? pa),
      paddingRight: toPadding(pr ?? ph ?? pa),
      paddingBottom: toPadding(pb ?? pv ?? pa),
      paddingLeft: toPadding(pl ?? ph ?? pa),
      ...style,
    },
    className: [className, styledClassName].join(' '),
    ...rest,
  };
};
