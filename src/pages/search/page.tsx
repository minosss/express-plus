import type { AutocompleteItem } from '@mantine/core';
import type { AutoItem } from '../../api/types';
import { ActionIcon, Group, Autocomplete, Loader, Stack, Text } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { SearchIcon, XIcon, HistoryIcon } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Empty, Page } from '../../components/index';
import { MessageKind } from '../../types';
import { fetcher } from '../../utils/fetcher';
import { queryAtom } from '../detail/store';
import { openSearchAtom } from './store';
import { useHistory } from './use-history';
import { HistoryItem } from './history-item';

export const SearchPage = () => {
  const setOpenSearch = useSetAtom(openSearchAtom);
  const setQuery = useSetAtom(queryAtom);

  const [value, setValue] = useState('');
  const [debouncedValue] = useDebouncedValue(value, 500);

  const { data, isFetching: isLoading } = useQuery({
    queryKey: ['auto', debouncedValue],
    queryFn: () => fetcher<AutoItem[]>(MessageKind.Auto, debouncedValue),
    enabled: debouncedValue.length > 4,
  });

  const options: AutocompleteItem[] = data?.map(({ id, kind, name }) => ({ value: `${id}@${kind}`, label: name })) || [];

  const { data: histories = [] } = useHistory();

  return (
    <Page
      header={
        <Group h='100%'>
          <ActionIcon onClick={() => setOpenSearch(false)}>
            <XIcon />
          </ActionIcon>
          <Autocomplete
            placeholder='输入快递单号'
            autoFocus
            style={{ flex: 1 }}
            rightSection={isLoading ? <Loader size='xs' color='gray' /> : <SearchIcon />}
            value={value}
            onChange={(value_) => {
              let nextValue = value_;
              if (value_.includes('@')) {
                const [idValue = '', kindValue] = value_.split('@');
                nextValue = idValue;
                if (idValue && kindValue) {
                  setQuery({ id: idValue, kind: kindValue });
                }
                return;
              }
              setValue(nextValue.replaceAll(/[^\dA-Za-z]/g, ''));
            }}
            data={options}
          />
        </Group>
      }
    >
      {histories.length === 0
        ? (<Empty iconComponent={HistoryIcon} description='还没有任何记录' />)
        : (
          <Stack spacing={6} py='md' align='center'>
            <Text color='dimmed' size='xs'>最近 20 条查询记录</Text>
            {histories.map((history) => (
              <HistoryItem key={history.id} history={history} onQuery={() => {
                setQuery({ id: history.id, kind: history.kind, phone: history.phone });
              }} />
            ))}
          </Stack>
          )}
    </Page>
  );
};
