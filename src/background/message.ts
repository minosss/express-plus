import type { ExtensionMessage } from '../types';
import { runtime } from 'webextension-polyfill';
import { MessageKind, SettingsKind } from '../types';
import { log } from '../utils/log';
import { resetAlarm } from './alarm';
import { getDb, getSettings } from './db';

runtime.onMessage.addListener(async (message) => {
  log('resolve', message);

  const { kind, data } = message as ExtensionMessage;

  if ([
    MessageKind.Track,
    MessageKind.GetTrack,
    MessageKind.PutTrack,
    MessageKind.DeleteTrack,
    MessageKind.Settings,
    MessageKind.PutSettings,
  ].includes(kind) === false) {
    return new Promise(() => {});
  }

  const $db = await getDb();
  switch (kind) {
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
        return await resetAlarm();
      }

      return;
    }
  }

  return false;
});
