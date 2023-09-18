import type { AutocompleteItem } from '@mantine/core';
import type { AutoItem } from '../../api/types';
import { ActionIcon, Group, Autocomplete, Loader, Stack, Text, Modal, PinInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch, IconX, IconHistory } from '@tabler/icons-react';
import { atom, useAtom, useSetAtom } from 'jotai';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Empty, Page } from '../../components/index';
import { MessageKind } from '../../types';
import { fetcher } from '../../utils/fetcher';
import { queryAtom } from '../detail/store';
import { openSearchAtom } from './store';
import { useHistory } from './use-history';
import { HistoryItem } from './history-item';

type QueryIntput = { id: string; kind: string; phone?: string };

const stashAtom = atom<QueryIntput>({ id: '', kind: '', phone: '' });

export const SearchPage = () => {
  const setOpenSearch = useSetAtom(openSearchAtom);
  const setQuery = useSetAtom(queryAtom);
  const [stash, setStash] = useAtom(stashAtom);

  const [value, setValue] = useState('');
  const [debouncedValue] = useDebouncedValue(value, 500);

  const enabled = debouncedValue.length > 4;
  const { data, isFetching: isLoading } = useQuery({
    queryKey: ['auto', debouncedValue],
    queryFn: () => fetcher<AutoItem[]>(MessageKind.Auto, debouncedValue),
    enabled,
  });

  const fallback = !isLoading && enabled && data?.length === 0;
  const options: AutocompleteItem[] = fallback
    ? [{ value: debouncedValue, disabled: true, label: '或者再输入其它试试' }]
    : (data?.map(({ id, kind, name }) => ({ value: `${id}@${kind}`, label: name })) || []);

  const { data: histories = [] } = useHistory();

  //
  const [show, setShow] = useState(false);

  //
  const handleQuery = ({ id, kind, phone }: QueryIntput) => {
    if (kind === 'shunfeng' && phone?.length !== 4) {
      // save tmp query data
      setStash({ id, kind, phone: '' });
      // show dialog to input last 4 digits of phone number
      setShow(true);
    } else {
      setQuery({ id, kind, phone });
    }
  };

  return (
    <Page
      header={
        <Group h='100%'>
          <ActionIcon onClick={() => setOpenSearch(false)}>
            <IconX />
          </ActionIcon>
          <Autocomplete
            placeholder='输入快递单号'
            autoFocus
            style={{ flex: 1 }}
            rightSection={isLoading ? <Loader size='xs' color='gray' /> : <IconSearch />}
            value={value}
            onChange={(value_) => {
              let nextValue = value_;
              if (value_.includes('@')) {
                const [idValue = '', kindValue] = value_.split('@');
                nextValue = idValue;
                if (idValue && kindValue) {
                  handleQuery({ id: idValue, kind: kindValue });
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
      <Modal onClose={() => setShow(false)} opened={show} title='请输入验证码'>
        <Stack spacing={6} align='center'>
          <Text fz='sm'>顺丰需要收件人或者寄件人电话后 4 位</Text>
          <PinInput type='number' autoFocus defaultValue='' onComplete={(phone) => {
            setShow(false);
            setQuery({ id: stash.id, kind: stash.kind, phone });
            setStash({ id: '', kind: '', phone: '' });
          }} />
        </Stack>
      </Modal>
      {histories.length === 0
        ? (<Empty iconComponent={IconHistory} description='还没有任何记录' />)
        : (
          <Stack spacing={6} py='md' align='center'>
            <Text color='dimmed' size='xs'>最近 20 条查询记录</Text>
            {histories.map((history) => (
              <HistoryItem key={history.id} history={history} onQuery={() => {
                handleQuery(history);
              }} />
            ))}
          </Stack>
          )}
    </Page>
  );
};
