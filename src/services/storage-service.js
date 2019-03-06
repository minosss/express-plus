import {produce} from 'immer';
import browser from 'webextension-polyfill';

const DEFAULT_RECENT_HISTORY = 100;
const MAX_RECENT_HISTORY = 1000;

const defaultData = {
  settings: {
    enableAuto: false,
    autoInterval: 30,
    enableFilterDelivered: false,
    recentHistory: DEFAULT_RECENT_HISTORY
  },
  favorites: []
};

const HISTORY_KEY = 'ep-history';

let listenerInstalled = false;
const areaName = 'local';
const watchers = {};
const storage = browser.storage[areaName];

export default class StorageService {
  static onStorageChanged(changes, areaName) {
    for (const watcher of Object.values(watchers[areaName])) {
      const map = {};
      const keys = watcher.keys === '*' ? Object.keys(changes) : Array.isArray(watcher.keys) ? watcher.keys : [watcher.keys];

      for (const key of keys) {
        if (changes[key]) {
          map[key] = changes[key].newValue;
        }
      }

      watcher.callback(map);
    }
  }

  static watch(keys, callback = () => {}) {
    if (!watchers[areaName]) {
      watchers[areaName] = {};
    }

    const area = watchers[areaName];

    let id = Date.now().toString();
    while (area[id]) {
      id = Date.now().toString();
    }

    area[id] = {keys, callback};

    if (!listenerInstalled) {
      browser.storage.onChanged.addListener(StorageService.onStorageChanged);
      listenerInstalled = true;
    }

    return () => {
      delete area[id];
    };
  }

  static async save(data) {
    const savedData = await storage.set(data);
    return savedData;
  }

  static async get(data = defaultData) {
    const savedData = await storage.get(data);
    return savedData;
  }

  static async shouldFilterDelivered() {
    const {settings} = await StorageService.get('settings');
    return Boolean(settings.enableFilterDelivered);
  }

  static async getQueryFavorites() {
    const {favorites} = await StorageService.get('favorites');
    return favorites.filter(favorite => favorite.state !== '3');
  }

  static async updateFavorite(nextFavorite) {
    const {favorites} = await StorageService.get('favorites');
    let changed = false;
    const nextFavorites = produce(favorites, draft => {
      const index = favorites.findIndex(
        favorite => favorite.postId === nextFavorite.postId
      );
      if (index !== -1) {
        draft[index] = nextFavorite;
        changed = true;
      }
    });

    if (changed) {
      await StorageService.save({favorites: nextFavorites});
      return true;
    }

    return false;
  }

  static isLocalStoreAvailable() {
    return window && window.localStorage;
  }

  static async saveHistory({postId, type, phone, state, data, updatedAt}) {
    if (StorageService.isLocalStoreAvailable()) {
      let historyData = JSON.parse(window.localStorage.getItem(HISTORY_KEY)) || [];
      if (historyData && Array.isArray(historyData)) {
        const newItem = {postId, type, phone, state, updatedAt};
        if (data && data.length > 0) {
          newItem.latestMessage = {
            time: data[0].time,
            context: data[0].context
          };
        }

        // 已单号为标准，删除本来的记录
        const index = historyData.findIndex(h => h.postId === postId);
        if (index !== -1) {
          historyData.splice(index, 1);
        }

        historyData.unshift(newItem);
        //
        const settings = await StorageService.get('settings');
        const recentHistory = settings.recentHistory || DEFAULT_RECENT_HISTORY;
        historyData = historyData.slice(0, Math.min(recentHistory, MAX_RECENT_HISTORY));

        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(historyData));
      }
    }
  }

  static getAllHistory() {
    if (StorageService.isLocalStoreAvailable()) {
      const historyData = JSON.parse(window.localStorage.getItem(HISTORY_KEY));
      return historyData && Array.isArray(historyData) ? historyData : [];
    }

    return [];
  }

  static cleanAllHistory() {
    if (StorageService.isLocalStoreAvailable()) {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
    }
  }
}
