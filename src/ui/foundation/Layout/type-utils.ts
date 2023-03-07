// See https://blog.logrocket.com/build-strongly-typed-polymorphic-components-react-typescript/
import React from 'react';

type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProp<C extends React.ElementType, P = object> = React.PropsWithChildren<
  P & AsProp<C>
> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, P>>;

export type PolymorphicComponentPropWithRef<
  C extends React.ElementType,
  P = object,
> = PolymorphicComponentProp<C, P> & { ref?: PolymorphicRef<C> };

export type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>['ref'];
