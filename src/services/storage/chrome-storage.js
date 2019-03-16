import browser from 'webextension-polyfill';
import Base from './base';

class ChromeStorage extends Base {
  constructor() {
    super();
    this.type = 'chrome-storage';
    this.db = browser.storage.local;
  }

  async get(data) {
    return data ? this.db.get(data) : this.db.get();
  }

  async set(data) {
    return this.db.set(data);
  }

  onChanged(changes) {
    for (const watcher of Object.values(this.watchers)) {
      const value = {};
      const keys = watcher.keys === '*' ? Object.keys(changes) : Array.isArray(watcher.keys) ? watcher.keys : [watcher.keys];

      for (const key of keys) {
        if (changes[key]) {
          value[key] = changes[key];
        }
      }

      watcher.callback(value, watcher);
    }
  }

  addWatchListener() {
    if (!this.listenerInstalled) {
      browser.storage.onChanged.addListener(this.onChanged.bind(this));
      this.listenerInstalled = true;
    }
  }
}

export default ChromeStorage;
