import {alarms, runtime, notifications} from 'webextension-polyfill';
import {QueryState} from '../api/types';
import {MessageKind, Track} from '../types';
import {log} from '../utils/log';
import {getDb, getSettings, getUncheckList} from './db';

export const AUTO_QUERY_ALRAM = 'auto_query_alram';

alarms.onAlarm.addListener(async (alarm) => {
	if (alarm.name === 'auto_query_alram') {
		autoQuery();
	}
});

let running = false;

// task
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
			if (item.state !== QueryState.Delivered) {
				try {
					const data = await runtime.sendMessage({
						kind: MessageKind.Query,
						data: {id: item.id, kind: item.kind, phone: item.phone},
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
		}

		if (updates.length === 0) return;

		const db_ = await getDb();
		await db_.track?.bulkUpsert(updates);

		const settings = await getSettings();
		const deliveredOnly = settings.enableFilterDelivered === true;
		if (deliveredOnly) {
			updates = updates.filter((n) => n.state === QueryState.Delivered);
		}

		if (updates.length > 0) {
			notifications.create({
				iconUrl: 'icon.png',
				type: 'list',
				message: `有 ${updates.length} 个快递有新的信息！`,
				title: '快递助手',
				items: updates.map((n) => ({title: n.id, message: n.context ?? ''})),
			});
		}
	} catch {
		// ignore
	}

	running = false;
}

export async function resetAlarm() {
	log(`reset alarm`);

	const settings = await getSettings();

	await alarms.clear(AUTO_QUERY_ALRAM);

	let interval = Math.floor(settings.autoInterval ?? '0');
	if (interval > 0) {
		interval = Math.max(30, interval);
		alarms.create(AUTO_QUERY_ALRAM, {periodInMinutes: interval});
	}
}
