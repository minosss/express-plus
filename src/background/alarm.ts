import type { Track } from '../types';
import { QueryState } from '../api/types';
import { MessageKind } from '../types';
import { log } from '../utils/log';
import { getDb, getSettings, getUncheckList } from './db';

export const AUTO_QUERY_ALRAM = 'auto_query_alram';

const { alarms, runtime, notifications } = chrome;

export async function resetAlarm(focus = false) {
  const found = await alarms.get(AUTO_QUERY_ALRAM);

  if (found && !focus) return;

  const settings = await getSettings();

  if (found) {
    await alarms.clear(AUTO_QUERY_ALRAM);
  }

  let interval = Math.floor(settings.autoInterval ?? '0');
  if (interval > 0) {
    // 最小 60 分钟
    interval = Math.max(60, interval);
    alarms.create(AUTO_QUERY_ALRAM, { periodInMinutes: interval });
    log(`auto query every ${interval} minutes`);
  } else {
    log('auto query disabled');
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
resetAlarm();

alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === AUTO_QUERY_ALRAM) {
    autoQuery();
  }
});

let running = false;
async function autoQuery() {
  if (running) {
    log(`the auto task is running, skipped at ${Date.now()}`);
    return;
  }

  running = true;

  try {
    const list = await getUncheckList();
    log(`auto query ${list.length} items`);

    let updates: Track[] = [];
    for (const item of list) {
      try {
        const data = await runtime.sendMessage({
          kind: MessageKind.Query,
          data: { id: item.id, kind: item.kind, phone: item.phone },
        });

        const context = data.data[0]?.context;
        const next: Track = {
          ...item,
        };

        // null? or fake data
        if (
          context != null &&
          context !== '查无结果' &&
          // 只判断更新时间有没更新
          data.updatedAt > item.updatedAt
        ) {
          next.context = context;
          next.updatedAt = data.updatedAt;

          updates.push(next);
        }
      } catch {
        // ignore
      }
    }

    if (updates.length > 0) {
      const db_ = await getDb();
      await db_.track?.bulkUpsert(updates);

      const settings = await getSettings();
      const deliveredOnly = settings.enableFilterDelivered === true;
      if (deliveredOnly) {
        updates = updates.filter((n) => n.state === QueryState.Delivered);
      }

      if (updates.length > 0) {
        const iconUrl = runtime.getManifest().icons?.['128'];
        notifications.create({
          iconUrl,
          type: 'list',
          message: `有 ${updates.length} 个快递有新的信息！`,
          title: '快递助手',
          items: updates.map((n) => ({ title: n.id, message: n.context ?? '' })),
        });
      }
    }
  } catch (error) {
    console.error(error);
  }

  running = false;
}
