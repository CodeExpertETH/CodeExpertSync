import React from 'react';
import { StyledSystemProp, useStyledSystem } from './styled-system';
import { PolymorphicComponentPropWithRef, PolymorphicRef } from './type-utils';

export type BoxProps<C extends React.ElementType> = PolymorphicComponentPropWithRef<
  C,
  StyledSystemProp
>;

export type BoxComponent = <C extends React.ElementType = 'div'>(
  props: BoxProps<C>,
) => React.ReactElement | null;

// eslint-disable-next-line react/display-name
export const Box: BoxComponent = React.forwardRef(
  <C extends React.ElementType = 'div'>(
    { as, children, ...props }: BoxProps<C>,
    ref?: PolymorphicRef<C>,
  ) => {
    const Component = as ?? 'div';
    return (
      <Component {...useStyledSystem({ ...props, display: 'block' })} ref={ref}>
        {children}
      </Component>
    );
  },
);

(Box as $Unexpressable).displayName = 'Box';
