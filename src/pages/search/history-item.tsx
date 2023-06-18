import type { QueryHistory } from '../../types';
import { Text } from '@mantine/core';
import { KuaidiMap } from '../../api';

export interface HistoryItemProps {
  history: QueryHistory;
  onQuery?: () => void;
  onDelete?: () => void;
}

export const HistoryItem = ({ history, onQuery }: HistoryItemProps) => {
  return (
    <Text color='dimmed' size='sm' sx={(theme) => ({
      'userSelect': 'none',
      ':hover': {
        color: theme.colors.blue[7],
      },
    })} onClick={onQuery}>
      {KuaidiMap.get(history.kind) || history.kind} {history.id}
    </Text>
  );
};
