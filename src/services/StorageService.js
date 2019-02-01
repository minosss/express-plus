/* eslint-disable no-undef */
import produce from 'immer';

const defaultData = {
  settings: {
    enableAuto: false,
    autoInterval: 30,
    enableFilterDelivered: false,
  },
  favorites: [],
};

export default class StorageService {
  static save(data) {
    return new Promise(resolve => {
      chrome.storage.local.set(data, () => {
        console.log('set', data);
        resolve(data);
      });
    });
  }

  static getAll() {
    return new Promise(resolve => {
      chrome.storage.local.get(defaultData, data => {
        console.log('get: ', data);
        resolve(data);
      });
    });
  }

  static async shouldFilterDelivered() {
    return new Promise(resolve => {
      chrome.storage.local.get({setings: {}}, ({settings}) => {
        if (settings.enableFilterDelivered) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  static async getQueryFavorites() {
    return new Promise(resolve => {
      chrome.storage.local.get({favorites: []}, ({favorites}) => {
        resolve(favorites.filter(favorite => favorite.state !== '3'));
      });
    });
  }

  static async updateFavorite(nextFavorite) {
    return new Promise((resolve, _) => {
      chrome.storage.local.get({favorites: []}, ({favorites}) => {
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
          chrome.storage.local.set({favorites: nextFavorites}, () => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }
}
