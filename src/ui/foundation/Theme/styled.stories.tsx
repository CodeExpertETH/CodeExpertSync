/* eslint-disable @typescript-eslint/no-unused-vars */

import React from 'react';
import { css, GetStyles, keyframes, styled } from './styled';

export default {
  title: 'Foundation/Theme/styled',
};

const getStyles: GetStyles<object> = () => ({
  display: 'grid',
  placeItems: 'center',
  background: '#e0e0e0',
  height: 40,
  width: 40,
});

const TestComponent = React.forwardRef<HTMLDivElement, { label?: string }>(
  ({ label, ...rest }, ref) => (
    <div ref={ref} {...{ ...rest }}>
      {label ?? '🤖'}
    </div>
  ),
);
TestComponent.displayName = 'TestComponent';

// -------------------------------------------------------------------------------------------------
// Styled

const StyledDiv = styled('div', getStyles);
export const BasicDiv = () => <StyledDiv />;

const StyledComponent = styled(TestComponent, getStyles);
export const BasicComponent = () => <StyledComponent />;

const StyledVariantComponent = styled(TestComponent, (theme) => ({
  ...getStyles(theme),
  background: '#D7E9B9',
  variants: {
    ground: {
      sand: {
        background: '#FFEBB7',
      },
      ice: {
        background: '#E3F6FF',
      },
    },
    wide: {
      true: {
        width: 80,
      },
    },
  },
}));
export const VariantComponents = () => (
  <div style={{ display: 'flex', gap: 24 }}>
    <StyledVariantComponent label="🐰" />
    <StyledVariantComponent label={'🐫'} ground={'sand'} wide />
    <StyledVariantComponent label={'🐧'} ground={'ice'} />
  </div>
);

(function TypeLevelTests() {
  styled('div', () => ({
    variants: {
      // @ts-expect-error Number is not a valid variant group
      invalidValue: 0,
    },
  }));

  <StyledVariantComponent label={''} />;

  <StyledVariantComponent
    // @ts-expect-error Unknown variant name "unknownColor" can't be selected
    ground={'unknownColor'}
  />;

  <StyledVariantComponent
    // @ts-expect-error Unknown property can't be assigned a value
    unknownProp={1}
  />;
});

// -------------------------------------------------------------------------------------------------
// CSS

const useStyles = css(getStyles);
export const BasicCSS = () => <div className={useStyles()}></div>;

const useVariantStyles = css((theme) => ({
  ...getStyles(theme),
  variants: {
    wide: {
      true: {
        width: 80,
      },
    },
  },
}));
export const VariantCSS = () => <div className={useVariantStyles({ wide: true })}></div>;

// -------------------------------------------------------------------------------------------------
// Animations

const animation = keyframes({
  to: {
    transform: `rotate(360deg)`,
  },
});

const getAnimationStyles: GetStyles<object> = (theme) => ({
  ...getStyles(theme),
  animationName: animation,
  animationDuration: '1s',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'linear',
});

const StyledAnimationDiv = styled('div', getAnimationStyles);
export const AnimationDiv = () => <StyledAnimationDiv />;

const useAnimationStyles = css(getAnimationStyles);
export const AnimationCSS = () => <div className={useAnimationStyles()}>😵‍💫</div>;
