import { Box, Group, Modal, ScrollArea, Stack, Text, TextInput, UnstyledButton } from '@mantine/core';
import { useDebouncedValue, useUncontrolled } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import * as React from 'react';
import KuaidiData from '../../api/kuaidi-map.json';

export interface KindSelectProps {
  onSelect?(value: string): void;
  opened?: boolean;
  onOpenedChange?(value: boolean): void;
}

export const KindSelect: React.FC<KindSelectProps> = (props) => {
  const { onSelect, opened, onOpenedChange } = props;
  const [value, setValue] = React.useState('');
  const [value_] = useDebouncedValue(value, 200);
  const filteredKuaidiData = React.useMemo(
    () => KuaidiData.data.filter((kd) => kd.kind.includes(value_)),
    [value_],
  );

  const [opened_, setOpened] = useUncontrolled({
    value: opened,
    onChange: onOpenedChange,
  });

  return (
    <>
      <Modal
        opened={opened_}
        onClose={() => setOpened(false)}
        title={
          <TextInput
            placeholder='输入快递类型'
            autoFocus
            size='sm'
            w='100%'
            icon={<IconSearch />}
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
          />
        }
        padding={0}
        styles={(theme) => ({
          header: {
            padding: 20,
            margin: 0,
            borderBottom: `1px solid ${theme.colors.gray[2]}`,
          },
          body: {},
        })}
      >
        <ScrollArea.Autosize mah={380}>
          <Box
            p={8}
            onClick={(e) => {
              const { kind } = (e.target as HTMLElement).dataset;
              if (kind) {
                onSelect?.(kind);
              }
            }}
          >
            {filteredKuaidiData.map((kd) => (
              <UnstyledButton
                key={kd.kind}
                sx={(theme) => ({
                  'padding': '10px 12px',
                  'borderRadius': 4,
                  'width': '100%',
                  '&:hover': {
                    backgroundColor: theme.colors.gray[2],
                  },
                })}
                data-kind={kd.kind}
              >
                <Group style={{ pointerEvents: 'none' }}>
                  <Stack spacing={0}>
                    <Text size='sm'>{kd.name}</Text>
                    <Text size='xs' color='dimmed'>
                      {kd.kind}
                    </Text>
                  </Stack>
                </Group>
              </UnstyledButton>
            ))}
          </Box>
        </ScrollArea.Autosize>
      </Modal>
    </>
  );
};
