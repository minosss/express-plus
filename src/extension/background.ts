import browser from 'webextension-polyfill';
import createKuaidiService, {STATE_DELIVERED} from 'shared/utils/kuaidi';
import db, {Dexie} from 'shared/utils/db';
import log from 'shared/utils/log';
import {API_URLS, SETTING_KEYS} from 'shared/constants';

const kuaidi = createKuaidiService();

const AUTO_INTERVAL_DEFAULT = 60;
const QUERY_ALARM = 'queryAlarm';
const QUERY_ALARM_SCHEDULED_TIME = 'queryAlarmScheduledTime';

function toObject<T extends Record<string, any>>(arg: any[] = []): Promise<T> {
	return new Promise((resolve) => {
		const obj = arg.reduce((prev, curr) => {
			prev[curr.key] = curr.value;
			return prev;
		}, {});
		resolve(obj);
	});
}

const hasPatch = (favorite: Favorite, result: any) => {
	if (result && !result.error && Array.isArray(result.data) && result.data.length > 0) {
		const last = result.data[0];
		if (new Date(favorite.updatedAt).getTime() < new Date(last.time).getTime()) {
			return {
				// 只更新状态，和最新信息
				state: result.state,
				updatedAt: last.time,
				message: last.context,
			};
		}
	}
	return null;
};

class Background {
	db: Dexie;

	constructor() {
		this.db = db;

		// 和界面通信处理操作请求
		browser.runtime.onMessage.addListener(this.onMessage.bind(this));
		browser.runtime.onMessageExternal.addListener(this.onMessageExternal.bind(this));
		// 定时器
		browser.alarms.onAlarm.addListener(this.onAlarm.bind(this));
		// 自定义头信息
		browser.webRequest.onBeforeSendHeaders.addListener(
			this.onBeforeSendHeaders,
			{
				urls: ['https://m.kuaidi100.com/*'],
			},
			// Starting from Chrome 72, the following request headers are not provided and cannot be modified or removed without specifying 'extraHeaders' in opt_extraInfoSpec:
			// NOTE: firefox not support extraHeaders
			['requestHeaders', 'blocking', 'extraHeaders']
		);
		// 新版本
		browser.runtime.onUpdateAvailable.addListener((details: {version: string}) => {
			log('new version available', details.version);
		});
		// 安装或更新
		browser.runtime.onInstalled.addListener(this.onInstalled.bind(this));

		// db updating hook
		const bg = this;
		db.table('settings').hook('updating', function (mods, primKey, obj, trans) {
			this.onsuccess = function ({key, value}) {
				if (key === SETTING_KEYS.ENABLE_AUTO || key === SETTING_KEYS.AUTO_INTERVAL) {
					bg.resetQueryAlarm();
				}
			};
		});
	}

	async resetQueryAlarm() {
		browser.alarms.clear(QUERY_ALARM);

		const settings = await db.table('settings').toArray().then<Settings>(toObject);

		if (settings.enableAuto) {
			log('resetQueryAlarm', '开始自动查询');
			const min = Math.max(60, parseInt(settings.autoInterval || '0'));
			await browser.alarms.create(QUERY_ALARM, {periodInMinutes: min});
		} else {
			log('resetQueryAlarm', '关闭自动查询');
		}
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

	onInstalled({reason, previousVersion}: InstalledDetails) {
		log(reason, previousVersion);
		// reason: "install", "update", "chrome_update", or "shared_module_update"
		if (reason === 'update') {
			switch (previousVersion) {
				case '0.0.0':
					break;
				case '20.1.17.639':
					// 数据从 storage.local 迁移到 IndexedDB
					browser.storage.local.get(({favorites = [], settings = {}}: any) => {
						// NOTE: 默认保存历史记录，并且限定数量
						// settings: autoInterval, enableAuto, enableFilterDelivered, recentHistory
						const indexedSettings = [
							{
								key: SETTING_KEYS.AUTO_INTERVAL,
								value: settings.autoInterval || AUTO_INTERVAL_DEFAULT,
							},
							{key: SETTING_KEYS.ENABLE_AUTO, value: !!settings.enableAuto},
							{
								key: SETTING_KEYS.ENABLE_FILTER_DELIVERED,
								value: !!settings.enableFilterDelivered,
							},
							{
								key: SETTING_KEYS.ENABLE_IMPORT,
								value: true,
							},
						];
						db.table('settings').bulkPut(indexedSettings);
						// NOTE: 直接更新收藏的快递，已 postId 为主键
						// favorites: []{postId, ...}
						db.table('favorites').bulkPut(
							favorites.map((item: any) => {
								const {latestMessage = {}, ...rest} = item;
								return {
									...rest,
									updatedAt: latestMessage.time || Date.now(),
									message: latestMessage.context,
								};
							})
						);
					});
					break;
				default:
					break;
			}
		} else if (reason === 'install') {
			db.table('settings')
				.bulkPut([
					{key: SETTING_KEYS.AUTO_INTERVAL, value: AUTO_INTERVAL_DEFAULT},
					{key: SETTING_KEYS.ENABLE_AUTO, value: false},
					{key: SETTING_KEYS.ENABLE_FILTER_DELIVERED, value: false},
					{key: SETTING_KEYS.ENABLE_IMPORT, value: true},
				])
				.then(() => {
					log('install success');
				});
		}
	}

	// 检查嵌入页面是否过期
	async checkCookie(force = false) {
		const frame = (window.frames as any)['kuaidi'];
		if (!frame) {
			log('checkCookie', `iframe not found`);
			return false;
		}

		const key = SETTING_KEYS.COOKIES;
		const last = ((await db.table('settings').get(key)) || {value: 0}).value;
		const diff = Date.now() - last;
		// 过期时间应该是 20 分钟
		// 15 * 60 * 1000
		if (!force && diff < 900000) {
			return true;
		}

		return new Promise((resolve) => {
			frame.addEventListener(
				'load',
				async () => {
					const kd = document.createElement('iframe');
					kd.src = 'https://m.kuaidi100.com/result.jsp';
					frame.contentDocument.body.append(kd);

					const now = Date.now();
					log('checkCookie', '刷新 iframe', now);
					resolve(now);
					await db.table('settings').put({key, value: now});
				},
				{once: true}
			);
			frame.contentDocument.location.reload(true);
		});
	}

	onBeforeSendHeaders(details: HeaderDetails) {
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
						value: 'https://m.kuaidi100.com',
					},
					{
						name: 'X-Requested-With',
						value: 'XMLHttpRequest',
					},
					{
						name: 'User-Agent',
						// eslint-disable-next-line prettier/prettier
						value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
					}
				);
			}
		}
		return {
			requestHeaders: details.requestHeaders,
		};
	}

	// 触发定时
	async onAlarm(alarm: Alarm) {
		// name, scheduledTime, periodInMinutes
		if (alarm.name === QUERY_ALARM) {
			this.runQueryTask();
			// 下次定时时间
			db.table('settings').put({
				key: QUERY_ALARM_SCHEDULED_TIME,
				value: alarm.scheduledTime,
			});
		}
	}

	// 任务：自动查询
	async runQueryTask() {
		log('runQueryTask', Date.now());
		// 未收货的快递单，判断 state 不等于收货(3)
		const favorites = await db
			.table('favorites')
			.where('state')
			.notEqual(STATE_DELIVERED)
			.toArray();
		let patch = [];

		if (favorites.length > 0) {
			await this.checkCookie();
		} else {
			return;
		}

		// log(`待查询快递 ${favorites.map((fa) => fa.postId).join(',')}`);
		for (const fa of favorites) {
			const {postId, type, phone = ''} = fa;
			const result = await kuaidi.query({postId, type, phone});
			// {data}
			const p = hasPatch(fa, result);
			if (p) {
				patch.push({
					...fa,
					...p,
				});
			}
		}

		// 有单更新
		if (patch.length > 0) {
			log('有快递更新咯', patch);
			// 批量更新
			await db.table('favorites').bulkPut(patch);
			const settings = await db.table('settings').toArray().then<Settings>(toObject);
			// 是否只提示已签收的
			if (settings.enableFilterDelivered) {
				patch = patch.filter((item) => item.state === STATE_DELIVERED);
				log('只要收货的', patch);
			}

			// 转到通知
			const items = patch.map((item) => ({
				title: item.postId,
				message: item.message,
			}));
			if (items.length > 0) {
				this.showNotification({
					type: 'list',
					message: `有 ${items.length} 个快递有新的信息！`,
					items,
				});
			}
		}
	}

	async onMessageExternal(messageExt: any, sender: MessageSender) {
		log('onMessageExternal', messageExt);

		const {data, type} = messageExt;
		const settings = await db.table('settings').toArray().then<Settings>(toObject);

		if (type === 'import' && settings.enableImport) {
			if (data.postId && !(await db.table('favorites').get(data.postId))) {
				if (sender.origin === 'https://details.jd.com') {
					const {postId, tags = [], message, updatedAt} = data;

					db.table('favorites')
						.add({
							postId,
							type: 'jd',
							state: '0',
							createdAt: Date.now(),
							updatedAt,
							message,
							tags,
						})
						.then(() => {
							this.showNotification({message: `[京东] 添加了新的快递 ${postId}`});
						})
						.catch(() => {});
				}
			}
		}
	}

	// -
	async onMessage(message: any, sender: MessageSender) {
		log('onMessage', message);

		if (sender.id !== browser.runtime.id) {
			return true;
		}

		try {
			if (message.type === 'api') {
				const {url} = message;

				switch (url) {
					case API_URLS.REFRESH_COOKIES:
						const now = await this.checkCookie(true);
						return now;
					case API_URLS.KUAIDI_AUTO: {
						// 先查询已这单号开头的
						let fa = await db
							.table('favorites')
							.where('postId')
							.startsWith(message.data)
							.toArray();
						if (fa && fa.length > 0) {
							return fa;
						}
						// 没有就请求接口
						await this.checkCookie();
						return await kuaidi.auto(message.data);
					}

					// 快递查询
					case API_URLS.KUAIDI_QUERY:
						await this.checkCookie();
						let fa = (await db.table('favorites').get(message.data.postId)) || {};
						const isSaved = !!fa.postId;
						let result: any = {};

						try {
							result = await kuaidi.query(message.data);
							// 如果已经有记录就更新记录
							if (isSaved) {
								const p = hasPatch(fa, result);
								if (p) {
									db.table('favorites').put({
										...fa,
										...p,
									});
								}
							}
						} catch (error) {
							result.error = error.message;
						}

						// 保存历史记录
						try {
							// 同单号的记录只保存最新的，已单号为键，直接更新来保留一个最新的
							const {postId, type, phone} = message.data;
							await db
								.table('histories')
								.put({postId, type, phone, updatedAt: Date.now()});
						} catch (_error) {
							// ignore error
						}

						return {
							// 原型的记录
							...fa,
							// 查询的记录
							...result,
							// 当前的手机
							phone: message.data.phone || '',
						};

					case API_URLS.FAVORITES:
						return await db
							.table('favorites')
							.orderBy('updatedAt')
							.reverse()
							.sortBy('pin');
					case API_URLS.FAVORITES_GET:
						return await db.table('favorites').get(message.data);
					case API_URLS.FAVORITES_ADD:
						return await db.table('favorites').put(message.data);
					case API_URLS.FAVORITES_PATCH:
						const {postId, ...changes} = message.data;
						return await db.table('favorites').update(postId, changes);
					case API_URLS.FAVORITES_REMOVE:
						return await db.table('favorites').delete(message.data);

					// 历史记录
					case API_URLS.HISTORIES:
						return await db
							.table('histories')
							.orderBy('updatedAt')
							.reverse()
							.limit(message.data || 100)
							.toArray();
					case API_URLS.HISTORIES_CLEAR:
						return await db.table('histories').clear();

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

		return true;
	}
}

// -
(window as any).bg = new Background();
(window as any).bg.checkCookie(true);
