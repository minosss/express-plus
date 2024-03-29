import { Text, ActionIcon, Group, Tooltip, Box } from '@mantine/core';
import { IconEyeOff, IconSearch, IconSettings } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { Empty, Page } from '../../components/index';
import { openSearchAtom } from '../search/store';
import { openSettingsAtom } from '../settings/store';
import { queryAtom } from '../detail/store';
import { useTrack } from './use-track';
import { Loader } from './loader';
import { TrackItem } from './track-item';

export const TrackPage = () => {
  const setOpenSearch = useSetAtom(openSearchAtom);
  const setOpenSettings = useSetAtom(openSettingsAtom);
  const setQuery = useSetAtom(queryAtom);
  const { isLoading, data, deleteTrack } = useTrack();

  return (
    <Page
      header={
        <Group position='apart' h='100%'>
          <Text>快递助手</Text>
          <Group>
            <Tooltip label='点这里搜索' withArrow>
              <ActionIcon onClick={() => setOpenSearch(true)}>
                <IconSearch />
              </ActionIcon>
            </Tooltip>
            <Tooltip label='设置' withArrow>
              <ActionIcon onClick={() => setOpenSettings(true)}>
                <IconSettings />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      }
    >
      <Box>
        {isLoading
          ? (<Loader />)
          : (data?.length === 0
              ? (<Empty iconComponent={IconEyeOff} description='还没有任何记录' />)
              : (
                <Box>
                  {data?.map((item) => (
                    <TrackItem
                      key={item.id}
                      track={item}
                      onQuery={() => setQuery({ id: item.id, kind: item.kind, phone: item.phone }) }
                      onDelete={() => { deleteTrack(item.id); }}
                    />
                  ))}
                </Box>
                )
            )
        }
      </Box>
    </Page>
  );
};
