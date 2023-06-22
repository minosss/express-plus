import { AppShell } from '@mantine/core';
import * as React from 'react';
import { Content, Toolbar } from '../index';

export const Page: React.FC<
React.PropsWithChildren<{ header: React.ReactNode; style?: React.CSSProperties }>
> = ({ header, children, style }) => {
  return (
    <AppShell
      header={<Toolbar>{header}</Toolbar>}
      padding={0}
      style={style}
      styles={(theme) => ({
        root: {},
        main: {
          backgroundColor:
            theme.colorScheme === 'dark'
              ? theme.colors.gray[9]
              : theme.colors.gray[0],
        },
      })}
    >
      <Content>{children}</Content>
    </AppShell>
  );
};
