import type { ExtensionMessage } from '../types';
import { runtime } from 'webextension-polyfill';
import { createKuaidi100Client } from '../api/kuaidi100';
import { MessageKind, SettingsKind } from '../types';
import { log } from '../utils/log';
import { refreshCookies } from './fake-client';
import { addHistory, clearHistories, getHistories } from './history';
import { getDb, getSettings } from './db';

const client = createKuaidi100Client();

runtime.onMessage.addListener(async (message) => {
  log('resolve', message);

  const { kind, data } = message as ExtensionMessage;

  const $db = await getDb();
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
        addHistory({
          id: data.id,
          kind: data.kind,
          phone: data.phone,
          createdAt: Date.now(),
        });

        await refreshCookies();
        return client.query(data);
      }

      throw new Error(`数据错误 ${data.id}`);
    }
    case MessageKind.RefreshCookies: {
      return refreshCookies(true);
    }
    case MessageKind.History: {
      return getHistories();
    }
    //
    case MessageKind.Track: {
      const track = await $db.track?.find({ sort: [{ updatedAt: 'asc' }] }).exec();
      return (track ?? []).map((doc) => doc.toJSON());
    }
    case MessageKind.GetTrack: {
      const found = await $db.track?.findOne(data).exec();
      if (found == null || found.deleted === true) return null;
      return found.toJSON();
    }
    case MessageKind.PutTrack: {
      return await $db.track?.upsert(data);
    }
    case MessageKind.DeleteTrack: {
      const deleted = await $db.track?.findOne(data).remove();
      return deleted;
    }
    case MessageKind.Settings: {
      return await getSettings();
    }
    case MessageKind.PutSettings: {
      if (typeof data !== 'object' || data == null) {
        throw new TypeError('Invalid settings object');
      }

      await $db.settings?.bulkUpsert(Object.entries(data).map(([key, value]) => ({ key, value })));

      if (
        data[SettingsKind.AutoInterval] != null &&
        typeof data[SettingsKind.AutoInterval] === 'number'
      ) {
        return runtime.sendMessage({ kind: MessageKind.ResetAlarm });
      }
      break;
    }
    case MessageKind.Clear: {
      if (Array.isArray(data) && data.includes('history')) {
        clearHistories();
      }
      if (Array.isArray(data) && data.includes('track')) {
        $db.track?.remove();
      }
      return;
    }
  }

  return false;
});
