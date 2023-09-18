import { ActionIcon, Box, Group, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import {
  IconX,
  IconRefresh,
  IconPhone,
  IconWifiOff,
  IconBookmarkMinus,
  IconBookmarkPlus,
} from '@tabler/icons-react';
import { Empty, Page } from '../../components/index';
import { QueryStateMap, KuaidiMap } from '../../api/state-map';
import { Loader } from './loader';
import { KindSelect } from './kind-select';
import { useKindSelect } from './use-kind-select';
import { useDetail } from './use-detail';

export const DetailPage = () => {
  const {
    needPhone,
    query,
    cleanQuery,
    isLoading,
    error,
    data,
    isTracking,
    isLoadingTracking,
    toggleTracking,
    refetchDetail,
  } = useDetail();

  const {
    opened: openedKindSelect,
    setOpened: setOpenKindSelect,
    onSelectKind,
    openKindSelect,
  } = useKindSelect();

  return (
    <Page
      header={
        <Group position='apart' h='100%'>
          <Group>
            <ActionIcon onClick={() => cleanQuery()}>
              <IconX />
            </ActionIcon>
            <Text>{query?.id}</Text>
          </Group>
          <Group>
            {needPhone && (
              <Tooltip label='手机后四位'>
                <ActionIcon>
                  <IconPhone />
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label={isTracking ? '取消追踪' : '追踪'}>
              <ActionIcon
                loading={isLoadingTracking}
                onClick={() => { toggleTracking(); }}
                color={isTracking ? 'blue' : undefined}
              >
                {isTracking ? <IconBookmarkMinus /> : <IconBookmarkPlus />}
              </ActionIcon>
            </Tooltip>
            <Tooltip label='刷新'>
              <ActionIcon onClick={() => {
                refetchDetail();
              }}>
                <IconRefresh />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      }
    >
      {isLoading
        ? (<Loader />)
        : (data == null
            ? (
              <Text size='sm' color='dimmed' py={89} align='center'>
                <IconWifiOff fontSize={64} />
                <Box component='p' m={0}>{(error as any)?.message || '出错了'}</Box>
              </Text>
              )
            : (
              <>
                <KindSelect
                  opened={openedKindSelect}
                  onOpenedChange={setOpenKindSelect}
                  onSelect={onSelectKind}
                />
                <SimpleGrid
                  cols={2}
                  px='md' py='xs'
                  sx={(theme) => ({
                    position: 'sticky',
                    top: 0,
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : '#fff',
                    borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
                  })}
                >
                  <Box>
                    <Text size='xs' color='dimmed'>单号</Text>
                    <Text size='sm'>{data.id}</Text>
                  </Box>
                  <Tooltip label='点击换公司查询'>
                    <Box onClick={openKindSelect}>
                      <Text size='xs' color='dimmed'>公司</Text>
                      <Text size='sm'>{KuaidiMap.get(data.kind) ?? data.kind}</Text>
                    </Box>
                  </Tooltip>
                  <Box>
                    <Text size='xs' color='dimmed'>状态</Text>
                    <Text size='sm'>{QueryStateMap[data.state] ?? data.state}</Text>
                  </Box>
                  <Box>
                    <Text size='xs' color='dimmed'>最后更新</Text>
                    <Text size='sm'>{data.updatedAt}</Text>
                  </Box>
                </SimpleGrid>
                <Stack px='md' py='xs' spacing='xs'>
                  {data.data.length === 0 && <Empty iconComponent={IconX} description='查无记录' />}
                  {data.data.map((item, i) => (
                    <Group key={`timeline-${i}`} noWrap spacing='xs' align='flex-start'>
                      <Text
                        size={i === 0 ? 'sm' : 'xs'}
                        color='dimmed'
                        sx={{
                          width: 89,
                          whiteSpace: 'break-spaces',
                          textAlign: 'center',
                          margin: 0,
                        }}
                      >
                        {item.time}
                      </Text>
                      <Text
                        size={i === 0 ? 'sm' : 'xs'}
                        color={i === 0 ? undefined : 'dimmed'}
                        sx={{ flex: 1 }}
                      >
                        {item.context}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </>
              )
          )
      }
    </Page>
  );
};
