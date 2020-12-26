import ky from 'ky';
import sortBy from 'lodash.sortby';
import keyBy from 'lodash.keyby';
import log from './log';
import all from './kuaidi_all.json';

// 状态码
export const STATE_IN_TRANSIT = '0';
export const STATE_ACCEPTED = '1';
export const STATE_DELIVERED = '3';
export const STATE_ERROR = '999';

export const STATES_MAP: Record<string, string> = {
	[STATE_IN_TRANSIT]: '在途中', // In transit
	[STATE_ACCEPTED]: '已揽收', // Accepted
	2: '疑难',
	[STATE_DELIVERED]: '已签收', // Delivered
	4: '退签',
	5: '同城派送中',
	6: '退回',
	7: '转单',
	[STATE_ERROR]: '异常',
};

export const TYPES = sortBy(all.data, ['type']);
export const TYPES_MAP = keyBy(TYPES, 'type');

const toURLSearchParams = (params: Record<string, any>) => {
	const r = new URLSearchParams();
	Object.keys(params).forEach((key) => {
		r.set(key, params[key]);
	});
	r.set('token', '');
	r.set('platform', 'MWWW');
	return r;
};

// 移动端接口
// https://m.kuaidi100.com
// TODO 支持付费配置
export class Service {
	request = ky.extend({prefixUrl: 'https://m.kuaidi100.com', headers: {}});

	async companyInfo() {}

	// 查询
	async query({postId, type, phone}: QueryParams): Promise<any> {
		log(`查询 ${postId}@${type}#${phone}`);
		const result = await this.request
			.post('query', {
				body: toURLSearchParams({
					postid: postId,
					id: 1,
					valicode: '',
					temp: Math.random(),
					type,
					phone,
				}),
			})
			.json<QueryResult>();

		const {nu, com, state, data, status, message} = result;

		if (status !== '200') {
			throw new Error(message);
		}

		return {
			postId: nu,
			type: com,
			state,
			data,
		};
	}

	// 识别
	async auto(postId: string) {
		const data = await this.request
			.post('apicenter/kdquerytools.do', {
				body: toURLSearchParams({}),
				searchParams: {
					method: 'autoComNum',
					text: postId,
				},
			})
			.json<AutoResult>();

		const list = data.autoDest || data.auto || [];
		return list.map((item) => ({type: item.comCode, postId, name: item.name}));
	}
}

export default function createKuaidiService() {
	return new Service();
}
