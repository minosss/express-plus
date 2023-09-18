import { useState } from 'react';
import { showNotification, updateNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { fetcher } from '../../utils/fetcher';
import { MessageKind, SettingsKind } from '../../types';

const notificationId = 'update-filter-delivered';

export function useFilterDelivered() {
  const [loading, setLoading] = useState(false);
  async function updateFilterDelivered(enable: boolean) {
    showNotification({
      id: notificationId,
      message: '更新过滤已签收快递',
      color: 'teal',
      loading: true,
    });
    setLoading(true);

    try {
      await fetcher(MessageKind.PutSettings, {
        [SettingsKind.EnableFilterDelivered]: enable,
      });
      updateNotification({
        id: notificationId,
        message: '更新过滤已签收快递成功',
        color: 'teal',
        icon: <IconCheck />,
        autoClose: 1000,
      });
    } catch {
      updateNotification({
        id: notificationId,
        message: '更新过滤已签收快递失败',
        color: 'red',
        icon: <IconX />,
        autoClose: 1000,
      });
    }

    setLoading(false);
  }

  return {
    loading,
    updateFilterDelivered,
  };
}
