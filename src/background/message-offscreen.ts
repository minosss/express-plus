import {runtime} from 'webextension-polyfill';
import {createKuaidi100Client} from '../api/kuaidi100';
import {ExtensionMessage, MessageKind} from '../types';
import {log} from '../utils/log';
import {wait} from '../utils/wait';
import {refreshCookies} from './fake-client';

const client = createKuaidi100Client();

runtime.onMessage.addListener(async (message, sender) => {
	const {kind, data} = message as ExtensionMessage;

	log('offscreen', message);

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
			throw new Error('Invalid query data');
		}
		case MessageKind.RefreshCookies: {
			return refreshCookies(true);
		}
	}

	await wait('hack', 10_000);
});
