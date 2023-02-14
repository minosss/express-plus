import {alarms} from 'webextension-polyfill';

export const AUTO_QUERY_ALRAM = 'auto_query_alram';

alarms.onAlarm.addListener(async (alarm) => {
	if (alarm.name === 'auto_query_alram') {
		await autoQuery();
	}
});

//
async function autoQuery() {}
