import {produce} from 'immer';
import browser from 'webextension-polyfill';

const defaultData = {
  settings: {
    enableAuto: false,
    autoInterval: 30,
    enableFilterDelivered: false
  },
  favorites: []
};

const HISTORY_KEY = 'ep-history';

export default class StorageService {
  static async save(data) {
    const savedData = await browser.storage.local.set(data);
    return savedData;
  }

  static async get(data = defaultData) {
    const savedData = await browser.storage.local.get(data);
    return savedData;
  }

  static async shouldFilterDelivered() {
    const {enableFilterDelivered} = await StorageService.get('settings');
    return Boolean(enableFilterDelivered);
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

  static saveHistory({postId, type, state, data}) {
    if (StorageService.isLocalStoreAvailable()) {
      const historyData = JSON.parse(window.localStorage.getItem(HISTORY_KEY)) || [];
      if (historyData && Array.isArray(historyData)) {
        const newItem = {postId, type, state};
        if (data && data.length > 0) {
          newItem.time = data[0].time;
          newItem.context = data[0].context;
        }

        // 已单号为标准，删除本来的记录
        const index = historyData.findIndex(h => h.postId === postId);
        if (index !== -1) {
          historyData.splice(index, 1);
        }

        historyData.unshift(newItem);
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
}
