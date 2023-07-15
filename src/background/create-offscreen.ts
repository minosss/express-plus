const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

async function hasDocument() {
  try {
    // unstable api
    return await chrome.offscreen.hasDocument();
  } catch {
    // ignore
  }

  // 这个好像在 114 版本会返回空的数组
  const matchedClients = await clients.matchAll();
  return matchedClients.some(
    (c) => c.url === chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH),
  );
}

let creating;
export async function ensureKuaidiDocument() {
  // install once
  if (await hasDocument()) return;

  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: ['IFRAME_SCRIPTING'],
      justification: 'fake_client_inject',
    });

    await creating;
    creating = null;
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
ensureKuaidiDocument();
