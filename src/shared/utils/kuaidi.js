import ky from 'ky';
import sortBy from 'lodash.sortby';
import keyBy from 'lodash.keyby';
import all from './kuaidi_all.json';

// 状态码
export const STATE_IN_TRANSIT = '0';
export const STATE_ACCEPTED = '1';
export const STATE_DELIVERED = '3';
export const STATE_ERROR = '999';

export const STATES_MAP = {
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

// const toURLSearchParams = (params) => {
// 	const r = new URLSearchParams();
// 	r.set('token', '');
// 	r.set('platform', 'MWWW');
// 	Object.keys(params).map((key) => {
// 		r.set(key, params[key]);
// 	});
// 	return r;
// };

// 移动端接口
// https://m.kuaidi100.com
export class Service {
	constructor() {
		this.request = ky.extend({prefixUrl: 'https://www.kuaidi100.com', headers: {}});
	}

	async companyInfo() {}

	// 查询
	async query({postId, type, phone}) {
		const result = await this.request
			.get('query', {
				searchParams: {
					type,
					phone,
					postid: postId,
					temp: Math.random(),
				},
			})
			.json();

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
	async auto(postId) {
		const data = await this.request
			.get('autonumber/autoComNum', {
				// body: toURLSearchParams({}),
				searchParams: {
					resultv2: 1,
					text: postId,
				},
			})
			.json();

		const list = data.autoDest || data.auto || [];
		return list.map((item) => ({type: item.comCode, postId, name: item.name}));
	}
}

export default function createKuaidiService(opts) {
	return new Service(opts);
}
