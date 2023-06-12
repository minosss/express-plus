import { showNotification, updateNotification } from '@mantine/notifications';
import { XIcon, CheckIcon } from 'lucide-react';
import { useState } from 'react';
import { MessageKind, SettingsKind } from '../../types';
import { fetcher } from '../../utils/fetcher';

const notificationId = 'update-interval-notification';

export function useUpdateInterval() {
  const [loading, setLoading] = useState(false);

  async function updateInterval(nextInterval: string | null) {
    if (nextInterval == null) throw new TypeError('Interval can not be null');

    showNotification({
      id: notificationId,
      message: nextInterval === '0' ? '关闭自动刷新' : `更新自动刷新时间为 ${nextInterval}`,
      color: 'teal',
      loading: true,
    });

    setLoading(true);

    try {
      await fetcher(MessageKind.PutSettings, {
        [SettingsKind.AutoInterval]: Number.parseInt(nextInterval),
      });
      updateNotification({
        id: notificationId,
        message: '更新自动刷新时间成功',
        color: 'teal',
        icon: <CheckIcon />,
        autoClose: 1000,
      });
    } catch {
      updateNotification({
        id: notificationId,
        message: '更新自动刷新时间失败',
        color: 'red',
        icon: <XIcon />,
        autoClose: 1000,
      });
    }

    setLoading(false);
  }

  return {
    loading,
    updateInterval,
    options: ['0', '60', '120', '240'],
  };
}
