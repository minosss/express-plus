import type { ModalProps } from '@mantine/core';
import { Box, Button, Checkbox, Group, Modal } from '@mantine/core';
import * as React from 'react';

export interface ClearModalProps extends Pick<ModalProps, 'opened' | 'onClose'> {}

export const ClearModal: React.FC<ClearModalProps> = (props) => {
  const [values, setValues] = React.useState<string[]>([]);

  return (
    <Modal centered title='清空数据' {...props}>
      <Box mx='-md' p='md' sx={(theme) => ({
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : '#fff',
      })}>
        <Checkbox.Group value={values} onChange={setValues}>
          <Checkbox
            value='track'
            label='追踪的快递记录'
            description='默认储存在本地浏览器中，清空无法撤回'
          ></Checkbox>
          <Checkbox
            value='history'
            label='搜索的历史记录'
            description='默认储存在浏览器 localStorage 中，清空无法撤回'
            mt='md'
          ></Checkbox>
        </Checkbox.Group>
      </Box>
      <Group position='right' mt='md'>
        <Button color='red' onClick={() => {}} disabled={values.length === 0}>
          清空
        </Button>
      </Group>
    </Modal>
  );
};
