class Base {
  constructor() {
    this.type = '';
    this.watchers = {};
    this.listenerInstalled = false;
  }

  get() {}

  set() {}

  remove() {}

  clear() {}

  getWatchId() {
    let id = Date.now().toString();
    while (this.watchers[id]) {
      id = Date.now().toString();
    }

    return id;
  }

  getUnsubscribe(id) {
    return () => {
      delete this.watchers[id];
    };
  }

  addWatchListener() {}

  watch(keys, callback) {
    const id = this.getWatchId();
    this.watchers[id] = {id, keys, callback};

    if (!this.listenerInstalled) {
      this.addWatchListener();
    }

    return this.getUnsubscribe(id);
  }
}

export default Base;
