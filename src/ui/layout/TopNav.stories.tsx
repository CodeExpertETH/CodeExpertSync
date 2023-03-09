import React from 'react';

import { TopNav } from './TopNav';

export default {
  component: TopNav,
};

export const Primary = () => (
  <div
    style={{
      background: '#001529', // This is hard-coded in Antd at the moment, we can't get at it otherwise.
    }}
  >
    <TopNav />
  </div>
);
