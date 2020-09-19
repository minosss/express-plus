import browser from 'webextension-polyfill';
import createKuaidiService from '@/shared/utils/kuaidi';
import db from '@/shared/utils/db';
import log from '@/shared/utils/log';
import {API_URLS} from '@/shared/constants';

const kuaidi = createKuaidiService();

const AUTO_INTERVAL_DEFAULT = 60;
const QUERY_ALARM = 'queryAlarm';
const QUERY_ALARM_SCHEDULED_TIME = 'queryAlarmScheduledTime';

const toObject = (arg = []) => {
	return new Promise((resolve) => {
		const obj = arg.reduce((prev, curr) => {
			prev[curr.key] = curr.value;
			return prev;
		}, {});
		resolve(obj);
	});
};

class Background {
	constructor() {
		// 和界面通信处理操作请求
		browser.runtime.onMessage.addListener(this.onMessage.bind(this));
		// 定时器
		browser.alarms.onAlarm.addListener(this.onAlarm.bind(this));
		// 自定义头信息
		browser.webRequest.onBeforeSendHeaders.addListener(
			this.onBeforeSendHeaders,
			{
				urls: ['https://m.kuaidi100.com/*'],
			},
			// Starting from Chrome 72, the following request headers are not provided and cannot be modified or removed without specifying 'extraHeaders' in opt_extraInfoSpec:
			['requestHeaders', 'blocking', 'extraHeaders']
		);
		// 新版本
		browser.runtime.onUpdateAvailable.addListener(({version}) => {
			log('new version available', version);
		});
		// 安装或更新
		browser.runtime.onInstalled.addListener(this.onInstalled.bind(this));

		// db updating hook
		const bg = this;
		db.table('settings').hook('updating', function (mods, primKey, obj, trans) {
			this.onsuccess = function ({key, value}) {
				if (key === 'enableAuto' || key === 'autoInterval') {
					bg.resetQueryAlarm();
				}
			};
		});
	}

	resetQueryAlarm() {
		browser.alarms.clear(QUERY_ALARM);

		db.table('settings')
			.toArray()
			.then(toObject)
			.then((settings) => {
				if (settings.enableAuto) {
					log('start query alarm');
					const min = Math.max(60, parseInt(settings.autoInterval || '0'));
					browser.alarms.create(QUERY_ALARM, {periodInMinutes: min});
				} else {
					log('stop query alarm');
				}
			});
	}

	async showNotification({type = 'basic', title = '快递助手', message = '新信息', ...rest}) {
		return await browser.notifications.create({
			iconUrl: 'icon.png',
			type,
			title,
			message,
			...rest,
		});
	}

	onInstalled({reason, previousVersion}) {
		// reason: "install", "update", "chrome_update", or "shared_module_update"
		if (reason === 'update') {
			switch (previousVersion) {
				case '0.0.0':
					break;
				case '20.1.17.639':
					// 数据从 storage.local 迁移到 IndexedDB
					browser.storage.local.get(({favorites = [], settings = {}}) => {
						// NOTE: 默认保存历史记录，并且限定数量
						// settings: autoInterval, enableAuto, enableFilterDelivered, recentHistory
						const indexedSettings = [
							{
								key: 'autoInterval',
								value: settings.autoInterval || AUTO_INTERVAL_DEFAULT,
							},
							{key: 'enableAuto', value: !!settings.enableAuto},
							{
								key: 'enableFilterDelivered',
								value: !!settings.enableFilterDelivered,
							},
						];
						db.table('settings').bulkPut(indexedSettings);
						// NOTE: 直接更新收藏的快递，已 postId 为主键
						// favorites: []{postId, ...}
						db.table('favorites').bulkPut(favorites);
					});
					break;
				default:
					break;
			}
		} else if (reason === 'install') {
			db.table('settings').bulkPut([
				{key: 'autoInterval', value: AUTO_INTERVAL_DEFAULT},
				{key: 'enableAuto', value: false},
				{key: 'enableFilterDelivered', value: false},
			]);
		}
	}

	// 检查嵌入页面是否过期
	async checkCookie() {
		const frame = window.frames['kuaidi100'];
		if (!frame) {
			log(`iframe not found`);
			return false;
		}

		const key = `cookieKuaidi100`;
		const last = ((await db.table('settings').get(key)) || {value: 0}).value;
		const diff = Date.now() - last;
		// 过期时间应该是 20 分钟
		// 15 * 60 * 1000
		if (diff < 900000) {
			return true;
		}

		log('reload frame kuaidi100');
		return new Promise((resolve) => {
			frame.addEventListener(
				'load',
				async () => {
					resolve(true);
					await db.table('settings').put({key, value: Date.now()});
				},
				{once: true}
			);
			frame.src = String(frame.src);
		});
	}

	onBeforeSendHeaders(details) {
		let referer;

		for (let i = 0; i < details.requestHeaders.length; i++) {
			if (details.requestHeaders[i].name === 'Referer') {
				referer = details.requestHeaders.splice(i, 1);
			}

			if (details.requestHeaders[i].name === 'Origin') {
				details.requestHeaders.splice(i, 1);
			}
		}

		if (referer && referer.length > 0) {
			const url = new URL(referer[0].value);
			details.requestHeaders.push({
				name: 'Referer',
				value: url.origin,
			});
		} else {
			const {url} = details;
			if (url.indexOf('m.kuaidi100.com') !== -1) {
				details.requestHeaders.push(
					{
						name: 'Accept',
						value: 'application/json, text/javascript, */*; q=0.01',
					},
					{
						name: 'Host',
						value: 'm.kuaidi100.com',
					},
					{
						name: 'Referer',
						value: 'https://m.kuaidi100.com/',
					},
					{
						name: 'X-Requested-With',
						value: 'XMLHttpRequest',
					}
				);
			}
		}
		return {
			requestHeaders: details.requestHeaders,
		};
	}

	// 触发定时
	async onAlarm(alarm) {
		// name, scheduledTime, periodInMinutes
		if (alarm.name === QUERY_ALARM) {
			// 下次定时时间
			db.table('settings').put({
				key: QUERY_ALARM_SCHEDULED_TIME,
				value: alarm.scheduledTime,
			});
		}
	}

	// -
	async onMessage(message, sender) {
		log(message);

		if (sender.id !== browser.runtime.id) {
			return Promise.resolve();
		}

		try {
			if (message.type === 'api') {
				const {url} = message;

				switch (url) {
					case API_URLS.KUAIDI_AUTO:
						await this.checkCookie();
						return await kuaidi.auto(message.data);
					case API_URLS.KUAIDI_QUERY:
						await this.checkCookie();
						let nextData =
							(await db.table('favorites').get(message.data.postId)) || {};
						try {
							const data = await kuaidi.query(message.data);
							nextData = {
								...nextData,
								...data,
							};
						} catch (error) {
							nextData.error = error.message;
						}
						return {
							...nextData,
							phone: message.data.phone || '',
						};
					case API_URLS.FAVORITES:
						return await db.table('favorites').toArray();
					case API_URLS.FAVORITES_GET:
						return await db.table('favorites').get(message.data);
					case API_URLS.FAVORITES_ADD:
					case API_URLS.FAVORITES_PATCH:
						return await db.table('favorites').put(message.data);
					case API_URLS.FAVORITES_REMOVE:
						return await db.table('favorites').delete(message.data);
					case API_URLS.SETTINGS:
						return await db.table('settings').toArray().then(toObject);
					case API_URLS.SETTINGS_PATCH:
						return await db.table('settings').put(message.data);
					default:
						break;
				}
			}
		} catch (error) {
			return Promise.reject(error);
		}

		return Promise.resolve();
	}
}

// -
new Background();
