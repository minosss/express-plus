import browser from 'webextension-polyfill';

export const internalMessageTypes = {
  LOAD: 'load',
  UPDATE: 'update',
  SIGN_IN: 'signIn',
  REFRESH_COOKIE: 'refreshCookie'
};

export class InternalMessage {
  constructor() {
    this.type = '';
    this.data = '';
  }

  static create(type, data) {
    const m = new InternalMessage();
    m.type = type;
    m.data = data;
    return m;
  }

  send() {
    return browser.runtime.sendMessage(this);
  }
}
