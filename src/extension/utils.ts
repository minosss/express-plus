import browser from 'webextension-polyfill';
import dayjs from 'dayjs';

const isJsonLike = (str: string) => /^\{.*?\}$/.test(str);

export const fetcher = async (url: string, data?: any) => {
	console.log('req > ', url, data);

	try {
		const res = await browser.runtime.sendMessage({
			type: 'api',
			url,
			data: typeof data === 'object' ? data : isJsonLike(data) ? JSON.parse(data) : data,
		});
		console.log('res > ', res);
		return res;
	} catch (error) {
		console.error(error);
		return Promise.reject(error);
	}
};

export const toFavorite = (data: any) => {
	const {postId, type, state, phone, tags = [], data: messages = [], pin = false} = data;

	let message: any = {};
	if (messages && messages.length) {
		message = {
			time: messages[0].time,
			context: messages[0].context,
		};
	} else {
		message = {
			time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
			context: '未查询到信息',
		};
	}

	return {
		postId,
		type,
		state,
		pin,
		phone,
		tags,
		createdAt: Date.now(),
		updatedAt: message.time,
		message: message.context,
	};
};

export const getVersion = () => browser.runtime.getManifest().version;
export const getHomePageUrl = () => browser.runtime.getManifest().homepage_url;
export const getStoreUrl = () =>
	`https://chrome.google.com/webstore/detail/${browser.runtime.id}`;
export const reportIssue = () => {
	let url = 'https://github.com/minosss/express-plus/issues/new?title=&body=';

	try {
		const version = getVersion();
		const body = `


<!-- 请在上面留言 -->
快递助手 ${version}
${navigator.userAgent}`;

		url += encodeURIComponent(body);
	} catch (_) {}

	window.open(url);
};
