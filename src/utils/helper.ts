import {runtime} from 'webextension-polyfill';

export const getVersion = () => runtime.getManifest().version;
export const getHomePageUrl = () => runtime.getManifest().homepage_url;
export const getStoreUrl = () => `https://chrome.google.com/webstore/detail/${runtime.id}`;
export const reportIssue = () => {
	let url = 'https://github.com/minosss/express-plus/issues/new?title=&body=';

	try {
		const version = getVersion();
		const body = `
<!-- 请在上面留言 -->
快递助手 ${version}
${navigator.userAgent}`;

		url += encodeURIComponent(body);
	} catch {
		// ignored
	}

	window.open(url);
};
