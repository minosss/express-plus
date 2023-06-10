import { log } from '../utils/log';

const KEY = 'lastRefresh';
function getLastRefresh() {
  const last = window.localStorage.getItem(KEY);
  if (!last) {
    return 0;
  }
  return Number.parseInt(last, 10);
}

const lastRefresh = getLastRefresh();
export async function refreshCookies(force = false) {
  const frame = (window.frames as any).kuaidi;
  if (!frame) {
    throw new Error('iframe (kuaidi) not found');
  }

  const diff = Date.now() - lastRefresh;

  log(`touch cookies: ${lastRefresh} in ${diff}`);

  // 15min
  if (!force && diff < 900_000) {
    return lastRefresh;
  }

  log('refresh cookies');

  return new Promise((resolve) => {
    frame.addEventListener(
      'load',
      async () => {
        const kd = document.createElement('iframe');
        kd.src = 'https://m.kuaidi100.com/result.jsp';
        frame.contentDocument.body.append(kd);
        // 等里面的 iframe 加载完毕
        kd.addEventListener(
          'load',
          async () => {
            const now = Date.now();
            resolve(now);
            log(`refresh done at ${now}`);
            window.localStorage.setItem(KEY, `${now}`);
          },
          { once: true },
        );
      },
      { once: true },
    );
    frame.contentDocument.location.reload(true);
  });
}
