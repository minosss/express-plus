import browser from 'webextension-polyfill';
import KuaidiService, {STATE_DELIVERED, STATE_IN_TRANSIT} from '../../services/kuaidi-service';
import StorageService from '../../services/storage-service';

async function runAutoUpdate() {
  const messages = await KuaidiService.update();

  if (messages.length > 0) {
    // 通知 list 格式
    const items = messages.map(msg => {
      return {
        title: msg.postId,
        message: msg.latestMessage.context
      };
    });

    showNotification({
      type: 'list',
      message: `有 ${items.length} 个快递有新的信息！`,
      items
    });
  }
}

function showNotification({
  type = 'basic',
  title = '新信息',
  message = '新信息',
  ...others
}) {
  const id = new Date().getTime().toString();
  browser.notifications.create(id, 'messages', {
    iconUrl: 'images/icon-32.png',
    type,
    title,
    message,
    ...others
  });
}

// TODO 改用 sendMessage 跟其它页面通信
browser.storage.onChanged.addListener(({settings}, _) => {
  if (!settings) {
    return;
  }

  const {oldValue, newValue} = settings;
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
});

// 闹钟处理，目前只有自动查询
browser.alarms.onAlarm.addListener(() => {
  runAutoUpdate();
});

// - 版本升级处理，处理一些崩溃性的数据更改 -
// eslint-disable-next-line camelcase
function handleUpdate_0112() {
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
      StorageService.save({favorites});
      window.localStorage.removeItem('ngStorage-marks');
    }

    showNotification({title: '版本升级', message: '全新的界面，数据迁移成功'});
  } catch (error) {
    showNotification({
      title: '错误',
      message: '数据迁移出现错误 ' + error.message
    });
  }
}
// -

// 应用安装、更新、浏览器更新都会触发
browser.runtime.onInstalled.addListener(({reason, previousVersion}) => {
  if (reason === 'update') {
    if (previousVersion === '0.1.12') {
      handleUpdate_0112();
    }
  }
});

function onBeforeSendHeaders(details) {
  for (let i = 0; i < details.requestHeaders.length; i++) {
    if (details.requestHeaders[i].name === 'Referer') {
      details.requestHeaders.splice(i, 1);
    }
  }

  details.requestHeaders.push({
    name: 'Referer',
    value: 'https://biz.trace.ickd.cn/'
  });
  return {
    requestHeaders: details.requestHeaders
  };
}

browser.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeaders, {
  urls: ['https://biz.trace.ickd.cn/*']
}, ['requestHeaders', 'blocking']);
