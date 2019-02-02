/* eslint-disable no-undef */
import KuaidiService from '@/services/KuaidiService';
import browser from 'webextension-polyfill';

async function runAutoUpdate() {
  const messages = await KuaidiService.update();

  if (messages.length) {
    // 通知 list 格式
    const items = messages.map(msg => {
      return {
        title: msg.postId,
        message: msg.lastestData.context,
      };
    });

    showNotification({
      type: 'list',
      message: `有 ${items.length} 个快递有新的信息！`,
      items,
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
    ...others,
  });
}

// TODO 改用 sendMessage 跟其它页面通信
browser.storage.onChanged.addListener(({settings}, _) => {
  const {oldValue, newValue} = settings;
  if (newValue.enableAuto) {
    if (
      newValue.enableAuto !== oldValue.enableAuto ||
      newValue.autoInterval !== oldValue.autoInterval
    ) {
      // 需要重新设置
      browser.alarms.clearAll();
      // periodInMinutes - If set, the onAlarm event should fire every periodInMinutes minutes after the initial event specified by when or delayInMinutes. If not set, the alarm will only fire once.
      browser.alarms.create({
        periodInMinutes:
          // - 最短间隔 30 分钟 - 请求速度太快会导致 ip 被封。
          newValue.autoInterval < 30 ? 30 : newValue.autoInterval,
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
function handleUpdate_0112() {
  try {
    browser.alarms.clearAll();
    const preRawData = window.localStorage.getItem('ngStorage-marks');
    const preData = JSON.parse(preRawData);
    if (Array.isArray(preData)) {
      preData.map(item => {
        return {
          postId: item.id,
          type: item.com,
          tags: item.tags,
          lastestData: {
            time: item.time,
            context: item.text,
          },
          state: item.check ? '3' : '0',
        };
      });
    }
    showNotification({title: '版本升级', message: '全新的界面，数据迁移成功'});
  } catch (err) {
    showNotification({
      title: '错误',
      message: '数据迁移出现错误 ' + err.message,
    });
  }
}
// -

// 应用安装、更新、浏览器更新都会触发
browser.runtime.onInstalled.addListener((reason, previousVersion) => {
  if (reason === 'update') {
    if (previousVersion === '0.1.12') handleUpdate_0112();
  }
});
