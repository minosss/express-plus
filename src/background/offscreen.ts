import { log } from '../utils/log';

let installed = false;
export function createKuaidiDocument(force = false) {
  if (installed && !force) return;

  installed = true;

  try {
    log('install offscreen');
    chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['IFRAME_SCRIPTING'],
      justification: 'fake_client_inject',
    });
  } catch {
    log('install offscreen failed');
  }
}
