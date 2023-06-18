import type { History } from '../../types';
import { Text } from '@mantine/core';
import { KuaidiMap } from '../../api';

export interface HistoryItemProps {
  history: History;
}

export const HistoryItem = ({ history }: HistoryItemProps) => {
  return (
    <Text color='dimmed' size='sm'>
      {KuaidiMap.get(history.kind) || history.kind} {history.id}
    </Text>
  );
};
