import {runtime, alarms, storage} from 'webextension-polyfill';
import {ExtensionMessage, MessageKind, SettingsKind, Settings} from '../types';
import {log} from '../utils/log';
import {wait} from '../utils/wait';
import {AUTO_QUERY_ALRAM} from './alarm';
import {getDb} from './db';

const defaultSettings: Partial<Settings> = {
	autoInterval: 60,
	enableFilterDelivered: true,
};

runtime.onMessage.addListener(async (message) => {
	log('resolve', message);

	const {kind, data} = message as ExtensionMessage;

	switch (kind) {
		case MessageKind.Track: {
			const track = await getDb()
				.track?.find({sort: [{updatedAt: 'asc'}]})
				.exec();
			return track ?? [];
		}
		case MessageKind.GetTrack: {
			const found = await getDb().track?.findOne(data).exec();
			if (found.deleted === true) return null;
			return found;
		}
		case MessageKind.PutTrack: {
			return await getDb().track?.upsert(data);
		}
		case MessageKind.DeleteTrack: {
			const deleted = await getDb().track?.findOne(data).remove();
			return deleted;
		}
		case MessageKind.Settings: {
			const settings = await getDb().settings?.find().exec();
			if (settings == null) return defaultSettings;

			const result: any = {...defaultSettings};
			for (const {key, value} of settings) {
				if (typeof key === 'string' && key in result) {
					result[key] = value;
				}
			}
			return result;
		}
		case MessageKind.PutSettings: {
			if (typeof data !== 'object' || data == null) {
				throw new TypeError('Invalid settings object');
			}

			await getDb().settings?.bulkUpsert(
				Object.entries(data).map(([key, value]) => ({key, value}))
			);

			if (
				data[SettingsKind.AutoInterval] != null &&
				typeof data[SettingsKind.AutoInterval] === 'number'
			) {
				await alarms.clear(AUTO_QUERY_ALRAM);

				let interval = Math.floor(data[SettingsKind.AutoInterval]);
				const enable = interval > 0;
				if (enable) {
					interval = Math.max(30, interval);
					alarms.create(AUTO_QUERY_ALRAM, {periodInMinutes: interval});
				}
			}

			return;
		}
	}

	await wait('hack', 10_000);
});
