import { Box, ScrollArea } from '@mantine/core';
import * as React from 'react';

export const Content: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <ScrollArea.Autosize mah={500}>
      <Box mih={500}>{children}</Box>
    </ScrollArea.Autosize>
  );
};
