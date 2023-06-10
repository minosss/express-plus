import { useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { MessageKind } from '../../types';
import { fetcher } from '../../utils/fetcher';

export function useRefreshCookies() {
  const [loading, setLoading] = useState(false);

  async function refreshCookies() {
    setLoading(true);

    try {
      await fetcher(MessageKind.RefreshCookies);
      showNotification({
        message: '刷新 Cookies 成功',
        color: 'teal',
        autoClose: 1000,
      });
    } catch {
      showNotification({
        message: '刷新 Cookies 失败',
        color: 'red',
        autoClose: 1000,
      });
    }

    setLoading(false);
  }

  return {
    loading,
    refreshCookies,
  };
}
