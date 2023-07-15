import { runtime } from 'webextension-polyfill';
import { resetAlarm } from './alarm';

runtime.onInstalled.addListener((details) => {
  resetAlarm(true);
});
