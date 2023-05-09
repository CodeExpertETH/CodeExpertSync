import React from 'react';
import { useTheme } from '@/ui/foundation/Theme';
import { BoxProps } from './Box';
import {
  Align,
  Justify,
  Size,
  StyledSystemProp,
  alignItems,
  justifyContent,
  sizeToNumber,
  useStyledSystem,
} from './styled-system';
import { PolymorphicComponentPropWithRef, PolymorphicRef } from './type-utils';

export type StackProps<C extends React.ElementType> = PolymorphicComponentPropWithRef<
  C,
  StyledSystemProp &
    BoxProps<C> & {
      justify?: Justify;
      align?: Align;
      gap?: Size | number | boolean;
      wrap?: boolean;
      marginTrim?: 'block';
    }
>;

export type StackComponent = <C extends React.ElementType = 'div'>(
  props: StackProps<C>,
) => React.ReactElement | null;

// eslint-disable-next-line react/display-name
const Stack = <C extends React.ElementType = 'div'>(
  { align, as, children, gap, justify, style, wrap, ...props }: StackProps<C>,
  ref?: PolymorphicRef<C>,
) => {
  const { tokens } = useTheme();
  const Component = as ?? 'div';
  const elementStyles = {
    justifyContent: justifyContent(justify),
    alignItems: alignItems(align),
    gap: sizeToNumber(tokens, 'size')(gap),
    flexWrap: wrap ? 'wrap' : 'nowrap',
    ...style,
  };
  return (
    <Component {...useStyledSystem({ ...props, style: elementStyles })} ref={ref}>
      {children}
    </Component>
  );
};

export const HStack: StackComponent = React.forwardRef(Stack);
(HStack as $Unexpressable).displayName = 'HStack';
(HStack as $Unexpressable).defaultProps = { display: 'flexRow' };

export const VStack: StackComponent = React.forwardRef(Stack);
(VStack as $Unexpressable).displayName = 'VStack';
(VStack as $Unexpressable).defaultProps = { display: 'flexColumn' };
