import { runtime } from 'webextension-polyfill';
import { resetAlarm } from './alarm';
import { createKuaidiDocument } from './offscreen';

createKuaidiDocument();
resetAlarm();

runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // runtime.setUninstallURL('')
  }
});
