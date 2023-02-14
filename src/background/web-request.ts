import {webRequest} from 'webextension-polyfill';

webRequest.onBeforeSendHeaders.addListener(
	(details) => {
		console.log(details);
	},
	{
		urls: ['https://m.kuaidi100.com/*'],
	},
	['requestHeaders', 'extraHeaders']
);
