import { runtime } from 'webextension-polyfill';
import { log } from './log';

// const isJsonLike = (str: string) => /^{.*?}$/.test(str);

export const fetcher = async <T = any>(url: string | [string, ...any], data?: any) => {
  log('req >', url, data);

  const kind = Array.isArray(url) ? url[0] : url;
  const res = await runtime.sendMessage({
    kind,
    data,
  });
  log('res >', res);
  return res as T;
};
