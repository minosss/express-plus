import type { ExtensionMessage } from '../types';
import { runtime } from 'webextension-polyfill';
import { createKuaidi100Client } from '../api/kuaidi100';
import { MessageKind } from '../types';
import { log } from '../utils/log';
import { refreshCookies } from './fake-client';

const client = createKuaidi100Client();

runtime.onMessage.addListener(async (message) => {
  log('offscreen', message);

  const { kind, data } = message as ExtensionMessage;

  if ([
    MessageKind.Auto,
    MessageKind.Query,
    MessageKind.RefreshCookies,
  ].includes(kind) === false) {
    return new Promise(() => {});
  }

  switch (kind) {
    // api
    case MessageKind.Auto: {
      if (typeof data === 'string' && data.length > 5) {
        return client.auto(data);
      }
      // empty list
      return [];
    }
    case MessageKind.Query: {
      if (typeof data === 'object' && data.kind && data.id) {
        await refreshCookies();
        return client.query(data);
      }

      throw new Error(`数据错误 ${data.id}`);
    }
    case MessageKind.RefreshCookies: {
      return refreshCookies(true);
    }
  }

  return false;
});
