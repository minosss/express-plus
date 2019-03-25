import {produce} from 'immer';
import {ChromeStorage, LocalStorage} from './storage';

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

const storage = new ChromeStorage();
const localStorage = new LocalStorage();

export default class StorageService {
  // storage.local

  static async set(data) {
    const savedData = await storage.set(data);
    return savedData;
  }

  static async get(data = defaultData) {
    const savedData = await storage.get(data);
    return savedData;
  }

  static watch(keys, callback) {
    return storage.watch(keys, callback);
  }

  static async shouldFilterDelivered() {
    const {settings} = await storage.get('settings');
    return Boolean(settings.enableFilterDelivered);
  }

  static async getQueryFavorites() {
    const {favorites} = await storage.get('favorites');
    return favorites.filter(favorite => favorite.state !== '3');
  }

  static async updateFavorite(nextFavorite) {
    const {favorites} = await storage.get('favorites');
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
      await storage.set({favorites: nextFavorites});
      return true;
    }

    return false;
  }

  // localStorage

  static async saveHistory({postId, type, phone, state, data, updatedAt}) {
    let {[HISTORY_KEY]: historyData} = await localStorage.get({
      [HISTORY_KEY]: []
    });

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
      historyData = historyData.slice(
        0,
        Math.min(recentHistory, MAX_RECENT_HISTORY)
      );

      await localStorage.set({[HISTORY_KEY]: historyData});
      // window.localStorage.setItem(HISTORY_KEY, JSON.stringify(historyData));
    }
  }

  static async getAllHistory() {
    const {[HISTORY_KEY]: historyData} = await localStorage.get({
      [HISTORY_KEY]: []
    });
    return historyData;
  }

  static cleanAllHistory() {
    localStorage.set({[HISTORY_KEY]: []});
  }
}
