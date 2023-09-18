import type { ColorScheme } from './store';
import { Text, ActionIcon, Group, Box, Button, Switch, Select, Tooltip } from '@mantine/core';
import { IconX, IconBrandGithub, IconBrandChrome } from '@tabler/icons-react';
import { useAtom, useSetAtom } from 'jotai';
import { useQuery } from '@tanstack/react-query';
import { useId } from 'react';
import { useLocalStorage } from '@mantine/hooks';
import dayjs from 'dayjs';
import { Page } from '../../components/index';
import { MessageKind } from '../../types';
import { fetcher } from '../../utils/fetcher';
import { getHomePageUrl, getStoreUrl, getVersion } from '../../utils/helper';
import { openSettingsAtom, openClearModalAtom, colorSchemeAtom } from './store';
import { SettingItem } from './setting-item';
import { Loader as PageLoader } from './loader';
import { ClearModal } from './clear-modal';
import { useUpdateInterval } from './use-update-interval';
import { useFilterDelivered } from './use-filter-delivered';
import { useRefreshCookies } from './use-refresh-cookies';

const VERSION = getVersion();
const HOMEPAGE = getHomePageUrl();
const STORE = getStoreUrl();

export const SettingsPage = () => {
  const uid = useId();
  const setOpened = useSetAtom(openSettingsAtom);
  const { data: settings, isLoading } = useQuery({
    queryKey: [MessageKind.Settings, uid],
    queryFn: () => fetcher(MessageKind.Settings),
  });

  const [openClearModal, setOpenClearModal] = useAtom(openClearModalAtom);

  const upInterval = useUpdateInterval();
  const upFilter = useFilterDelivered();
  const refresh = useRefreshCookies();

  const [refreshAt] = useLocalStorage({ key: 'lastRefresh' });

  const [colorScheme, setColorScheme] = useAtom(colorSchemeAtom);

  return (
    <Page
      header={
        <Group h='100%'>
          <ActionIcon onClick={() => setOpened(false)}>
            <IconX />
          </ActionIcon>
          <Text>设置</Text>
        </Group>
      }
    >
      {isLoading
        ? (<PageLoader />)
        : (
          <Box>
            <SettingItem
              title='外观风格'
              rightSection={
                <Select
                  size='xs'
                  w={70}
                  defaultValue={colorScheme}
                  data={[{ value: 'auto', label: '系统' }, { value: 'light', label: '明亮' }, { value: 'dark', label: '暗黑' }]}
                  onChange={(value: ColorScheme) => { setColorScheme(value || 'auto'); }}
                />
              }
            />
            <SettingItem
              title='自动刷新(分钟)'
              description='后台自动刷新追踪的快递，设置为0则不自动更新'
              rightSection={
                <Select
                  size='xs'
                  w={70}
                  defaultValue={`${settings?.autoInterval}`}
                  data={upInterval.options}
                  disabled={upInterval.loading}
                  onChange={upInterval.updateInterval}
                />
              }
            />
            <SettingItem
              title='只提示已签收快递'
              description='启用的话快递被签收才会出发提示信息'
              rightSection={
                <Switch
                  defaultChecked={settings?.enableFilterDelivered === true}
                  onChange={(e) => { upFilter.updateFilterDelivered(e.target.checked === true); }}
                  disabled={upFilter.loading}
                />
              }
            />
            <SettingItem
              title='数据'
              description='可以删除历史记录和追踪的数据'
              rightSection={<Button size='xs' onClick={() => setOpenClearModal(true)}>清空数据...</Button>}
            />
            <ClearModal
              opened={openClearModal}
              onClose={() => setOpenClearModal(false)}
            />
            <SettingItem
              title={`刷新Cookies ${/^\d+$/.test(refreshAt) ? dayjs(refreshAt).fromNow() : ''}`}
              description='频繁刷新可能被列入黑名单'
              rightSection={<Button color='red' size='xs' onClick={refresh.refreshCookies} loading={refresh.loading}>刷新</Button>}
            />
            <SettingItem
              title={`关于 (${VERSION})`}
              description='觉得好用可以去商店给个评价 ❤'
              rightSection={
                <Group>
                  <Tooltip label='Chrome 商店'>
                    <ActionIcon size='sm' onClick={() => { window.open(STORE); }}>
                      <IconBrandChrome />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label='Github'>
                    <ActionIcon size='sm' onClick={() => { window.open(HOMEPAGE); }}>
                      <IconBrandGithub fontSize={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              }
            />
          </Box>
          )
      }
    </Page>
  );
};
