import browser from 'webextension-polyfill';
import KuaidiService, {
  STATE_DELIVERED,
  STATE_IN_TRANSIT
} from '../../services/kuaidi-service';
import StorageService from '../../services/storage-service';
import {getExtensionVersion} from '../../utils';
import {internalMessageTypes} from '../../model/message-model';

class Background {
  constructor() {
    browser.runtime.onInstalled.addListener(UpdateHandler.handler);
    browser.alarms.onAlarm.addListener(AlarmHandler.handler);
    browser.runtime.onMessage.addListener(MessageHandler.handler);
    browser.webRequest.onBeforeSendHeaders.addListener(
      Background.onBeforeSendHeaders,
      {
        urls: [
          'https://www.kuaidi100.com/*',
          'https://m.kuaidi100.com/*',
          'https://sp0.baidu.com/*'
        ]
      },
      // Starting from Chrome 72, the following request headers are not provided and cannot be modified or removed without specifying 'extraHeaders' in opt_extraInfoSpec:
      ['requestHeaders', 'blocking', 'extraHeaders']
    );

    browser.webRequest.onSendHeaders.addListener(
      function (details) {
        console.log(details.requestHeaders);
      },
      {
        urls: ['https://www.kuaidi100.com/*', 'https://m.kuaidi100.com/*']
      },
      ['requestHeaders', 'extraHeaders']
    );
    // -
    StorageService.watch('settings', Background.onSettingsChanged);
  }

  static onSettingsChanged({settings}) {
    console.log('settings changed', settings);
    const {newValue, oldValue} = settings;
    if (newValue.enableAuto) {
      if (
        !oldValue ||
        newValue.enableAuto !== oldValue.enableAuto ||
        newValue.autoInterval !== oldValue.autoInterval
      ) {
        // 需要重新设置
        browser.alarms.clearAll();
        // PeriodInMinutes - If set, the onAlarm event should fire every periodInMinutes minutes after the initial event specified by when or delayInMinutes. If not set, the alarm will only fire once.
        browser.alarms.create({
          periodInMinutes:
            // - 最短间隔 30 分钟 - 请求速度太快会导致 ip 被封。
            newValue.autoInterval < 30 ? 30 : newValue.autoInterval
        });
      }
    } else {
      browser.alarms.clearAll();
    }
  }

  static onBeforeSendHeaders(details) {
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
        value: url.origin
      });
    } else {
      const {url} = details;
      // 插件請求的時候需要補充一些請求頭信息
      if (url.indexOf('kuaidi100.com') !== -1) {
        details.requestHeaders.push({
          name: 'Accept',
          value: 'application/json, text/javascript, */*; q=0.01'
        }, {
          name: 'Host',
          value: 'www.kuaidi100.com'
        }, {
          name: 'Referer',
          value: 'https://www.kuaidi100.com/'
        }, {
          name: 'X-Requested-With',
          value: 'XMLHttpRequest'
        });
      }
    }

    return {
      requestHeaders: details.requestHeaders
    };
  }

  static async showNotification({
    type = 'basic',
    title = '快递助手',
    message = '新信息',
    ...others
  }) {
    const id = await browser.notifications.create({
      iconUrl: 'icon.png',
      type,
      title,
      message,
      ...others
    });
    return id;
  }
}

class AlarmHandler {
  static handler() {
    AlarmHandler.runAutoUpdate();
  }

  static async runAutoUpdate() {
    await MessageHandler.refreshCookie();
    const messages = await KuaidiService.update();

    if (messages.length > 0) {
      // 通知 list 格式
      const items = messages.map(msg => {
        return {
          title: msg.postId,
          message: msg.latestMessage.context
        };
      });

      Background.showNotification({
        type: 'list',
        message: `有 ${items.length} 个快递有新的信息！`,
        items
      });
    }
  }
}

class MessageHandler {
  static async handler(message, sender) {
    if (sender.id !== browser.runtime.id) {
      return Promise.resolve({});
    }

    switch (message.type) {
      case internalMessageTypes.LOAD:
        return MessageHandler.load();
      case internalMessageTypes.UPDATE:
        return MessageHandler.update(message.data);
      case internalMessageTypes.REFRESH_COOKIE:
        return MessageHandler.refreshCookie(message.frameId);
      // case internalMessageTypes.SIGN_IN:
      // return this.firebase.signIn(message.data);
      default:
        break;
    }

    return Promise.resolve({});
  }

  static async load() {
    const data = await StorageService.get();
    return {data};
  }

  static async update(data) {
    const savedData = await StorageService.set(data);
    return {data: savedData};
  }

  static async refreshCookie(frameId = 'kuaidi100') {
    const frame = window.frames[frameId];
    if (!frame) {
      return Promise.resolve(false);
    }

    const key = `ep-refresh-cookie-${frameId}`;
    const last = await StorageService.getLocalStorage().get({[key]: 0});
    const diff = Date.now() - last;

    // 过期时间应该是 20 分钟
    // 15 * 60 * 1000
    if (diff < 900000) {
      return Promise.resolve(true);
    }

    return new Promise(resolve => {
      frame.addEventListener('load', () => {
        resolve(true);
        StorageService.getLocalStorage().set({[key]: Date.now()});
      }, {once: true});
      frame.src = String(frame.src);
    });
  }
}

// - 版本升级处理，处理一些崩溃性的数据更改 -
class UpdateHandler {
  static handler({reason, previousVersion}) {
    if (reason === 'update') {
      if (previousVersion === '0.1.12') {
        UpdateHandler.migrate0112();
      }

      Background.showNotification({
        message: `新版本 ${getExtensionVersion()} 已更新`
      });
    }
  }

  static migrate0112() {
    try {
      browser.alarms.clearAll();
      const preRawData = window.localStorage.getItem('ngStorage-marks');
      const preData = JSON.parse(preRawData);
      if (Array.isArray(preData)) {
        const favorites = preData.map(item => {
          return {
            postId: item.id,
            type: item.com,
            tags: item.tags,
            latestMessage: {
              time: item.time,
              context: item.text
            },
            state: item.check ? STATE_DELIVERED : STATE_IN_TRANSIT
          };
        });
        StorageService.set({favorites});
        window.localStorage.removeItem('ngStorage-marks');
      }

      Background.showNotification({message: '全新的界面，数据迁移成功'});
    } catch (error) {
      Background.showNotification({
        message: '数据迁移出现错误 ' + error.message
      });
    }
  }
}

// eslint-disable-next-line no-unused-vars
const background = new Background();
