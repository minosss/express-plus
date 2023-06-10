import { runtime } from 'webextension-polyfill';
import { resetAlarm } from './alarm';
import { createKuaidiDocument } from './offscreen';

runtime.onInstalled.addListener((details) => {
  createKuaidiDocument();
  resetAlarm();

  if (details.reason === 'install') {
    // runtime.setUninstallURL('')
  }
});
