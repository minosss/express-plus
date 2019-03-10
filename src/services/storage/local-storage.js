import Base from './base';

class LocalStorage extends Base {
  constructor() {
    super();
    this.type = 'local-storage';
    this.db = window.localStorage;
  }

  async get(data) {
    let keys = [];
    let initData = {};
    if (!Array.isArray(data) && typeof data === 'object') {
      keys = Object.keys(data);
      initData = data;
    } else if (typeof data === 'string') {
      keys = [data];
    } else if (Array.isArray(data)) {
      keys = data.filter(key => typeof key === 'string');
    }

    try {
      const res = keys.reduce((ret, key) => {
        const val = this.db.getItem(key);
        if (val) {
          ret[key] = JSON.parse(val);
        }

        return ret;
      }, initData);

      return Promise.resolve(res);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  set(data) {
    const keys = Object.keys(data);

    try {
      keys.forEach(key => {
        this.db.setItem(key, JSON.stringify(data[key]));
      });
    } catch (error) {
      return Promise.reject(error);
    }

    return Promise.resolve();
  }

  remove(keys) {
    if (typeof keys === 'string') {
      return this.db.removeItem(keys);
    }

    if (Array.isArray(keys)) {
      return keys.forEach(key => this.db.removeItem(key));
    }
  }

  clear() {
    return this.db.clear();
  }

  onChanged(e) {
    console.log(e);
  }

  addWatchListener() {
    if (!this.listenerInstalled) {
      window.addEventListener('storage', this.onChanged);
      this.listenerInstalled = true;
    }
  }
}

export default LocalStorage;
