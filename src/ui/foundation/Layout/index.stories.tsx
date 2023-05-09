import React from 'react';
import { styled, useTheme } from '@/ui/foundation/Theme';
import { Box } from './Box';
import { HStack, VStack } from './Stack';

const StyledBox = styled(Box, ({ tokens }) => ({
  background: tokens.colorBgLayout,
  borderRadius: tokens.borderRadius,
}));

export default {
  title: 'Foundation/Layout',
};

export const ExampleLayout = () => {
  const { tokens } = useTheme();
  const ref = React.useRef<HTMLUListElement>(null);
  React.useEffect(() => {
    if (ref.current != null) ref.current.style.background = tokens.colorInfoBg;
  }, [tokens.colorInfoBg]);

  return (
    <VStack
      style={{
        width: 800,
        height: 600,
        border: `1px solid ${tokens.colorBorder}`,
        borderRadius: tokens.borderRadiusOuter,
      }}
      gap
      marginTrim={'block'}
    >
      <HStack justify={'space-between'} pt>
        <StyledBox ml={'lg'} pa={'sm'}>
          Logo
        </StyledBox>
        <StyledBox mr={'lg'} pa={'sm'}>
          Navigation
        </StyledBox>
      </HStack>
      <HStack fill gap={'xxl'}>
        <StyledBox ref={ref} as={'ul'} fill ml={'lg'} mb={0} pv={'lg'}>
          {Array.from({ length: 100 }).map((_, i) => (
            <li key={i}>Item {i}</li>
          ))}
        </StyledBox>
        <VStack mr={'lg'} justify={'space-between'} fill>
          <StyledBox>Aside header</StyledBox>
          <VStack fill justify={'center'} align={'center'}>
            Aside content
          </VStack>
          <StyledBox>Aside footer</StyledBox>
        </VStack>
      </HStack>
      <StyledBox mb={'xl' /* Ignored due to parent's marginTrim */} pv={'lg'} align={'center'}>
        Footer
      </StyledBox>
    </VStack>
  );
};
