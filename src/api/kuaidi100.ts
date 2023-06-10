import type { KuaidiClient } from './types';
import { now } from '../utils/helper';

const toURLSearchParams = (params: Record<string, any>) => {
  const r = new URLSearchParams();
  for (const key of Object.keys(params)) {
    r.set(key, params[key]);
  }
  r.set('token', '');
  r.set('platform', 'MWWW');
  return r;
};

interface Kuaidi100Options {
  host?: string;
}

// axios
export function createKuaidi100Client(_options: Kuaidi100Options = {}): KuaidiClient {
  const { host = 'https://m.kuaidi100.com' } = _options;
  return {
    // async company() {},
    async query({ id, kind, phone = '' }) {
      const res = await fetch(`${host}/query`, {
        method: 'POST',
        body: toURLSearchParams({
          postid: id,
          type: kind,
          phone,
          valicode: '',
          id: 1,
          temp: Math.random(),
        }),
      });

      if (res.status !== 200) {
        //
      }

      const data = await res.json();
      const { state, data: messages } = data as {
        nu: string;
        ischeck: string;
        com: string;
        status: string;
        state: string;
        data: any[];
      };

      return {
        id,
        kind,
        phone,
        state,
        updatedAt: messages[0]?.time ?? now(),
        data: messages.map(({ context, time }) => ({ context, time })),
      };
    },
    async auto(id) {
      const res = await fetch(
				`${host}/apicenter/kdquerytools.do?method=autoComNum&text=${id}`,
				{
				  method: 'POST',
				  body: toURLSearchParams({}),
				},
      );
      const data = await res.json();

      //
      const { auto = [] } = data as { num: string; auto: any[]; comCode: string };
      return auto.map(({ comCode, name }) => ({ kind: comCode, name, id }));
    },
  };
}
