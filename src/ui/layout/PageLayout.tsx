import React from 'react';
import { VStack } from '@/ui/foundation/Layout';

export const PageLayout = ({ children }: React.PropsWithChildren) => (
  <VStack gap="md" pv="lg" ph>
    {children}
  </VStack>
);
