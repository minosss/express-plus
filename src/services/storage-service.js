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
}
