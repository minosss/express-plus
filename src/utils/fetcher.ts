import { runtime } from 'webextension-polyfill';
import { log } from './log';

const TIMEOUT = 10 * 1000;

export const fetcher = async <T = any>(url: string | [string, ...any], data?: any) => {
  log('req >', url, data);

  const kind = Array.isArray(url) ? url[0] : url;

  const res = await Promise.race([
    runtime.sendMessage({
      kind,
      data,
    }),
    new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error('请求超时，请稍候重试'));
      }, TIMEOUT);
    }),
  ]);

  log('res <', res);

  return res as T;
};
