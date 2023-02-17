/* eslint-disable unicorn/no-await-expression-member */
import {runtime} from 'webextension-polyfill';
import {ExtensionMessage, MessageKind, SettingsKind} from '../types';
import {log} from '../utils/log';
import {wait} from '../utils/wait';
import {resetAlarm} from './alarm';
import {getDb, getSettings} from './db';

runtime.onMessage.addListener(async (message) => {
	log('resolve', message);

	const {kind, data} = message as ExtensionMessage;

	switch (kind) {
		case MessageKind.Track: {
			const track = await (await getDb()).track?.find({sort: [{updatedAt: 'asc'}]}).exec();
			return (track ?? []).map((doc) => doc.toJSON());
		}
		case MessageKind.GetTrack: {
			const found = await (await getDb()).track?.findOne(data).exec();
			if (found == null || found.deleted === true) return null;
			return found.toJSON();
		}
		case MessageKind.PutTrack: {
			return await (await getDb()).track?.upsert(data);
		}
		case MessageKind.DeleteTrack: {
			const deleted = await (await getDb()).track?.findOne(data).remove();
			return deleted;
		}
		case MessageKind.Settings: {
			return await getSettings();
		}
		case MessageKind.PutSettings: {
			if (typeof data !== 'object' || data == null) {
				throw new TypeError('Invalid settings object');
			}

			await (
				await getDb()
			).settings?.bulkUpsert(Object.entries(data).map(([key, value]) => ({key, value})));

			if (
				data[SettingsKind.AutoInterval] != null &&
				typeof data[SettingsKind.AutoInterval] === 'number'
			) {
				return await resetAlarm();
			}

			return;
		}
	}

	await wait('hack', 10_000);
});
