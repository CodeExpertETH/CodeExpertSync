import { Spin } from 'antd';
import React from 'react';
import { styled } from '@/ui/foundation/Theme';
import { Delayed } from './Delayed';

const StyledSpinContainer = styled('div', () => ({
  textAlign: 'center',
  background: 'rgba(0, 0, 0, 0.05)',
  borderRadius: '4px',
  padding: '30px 50px',
  margin: '20px 0',
}));

interface LoadingProps {
  text?: string;
  delayTime?: number;
  style?: React.CSSProperties;
}

const Loading = ({ delayTime = 0, text, style }: LoadingProps) => (
  <Delayed waitBeforeShow={delayTime}>
    <StyledSpinContainer>
      <Spin style={style} tip={text} />
    </StyledSpinContainer>
  </Delayed>
);

export default Loading;
