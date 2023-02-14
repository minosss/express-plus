import {QueryState} from './types';

export const QueryStateMap: Record<string, string> = {
	[QueryState.InTransit]: '在途中',
	[QueryState.Accepted]: '已揽收',
	[QueryState.Question]: '疑难',
	[QueryState.Delivered]: '已签收',
	[QueryState.Reject]: '退签',
	[QueryState.Delivering]: '同城派送中',
	[QueryState.Return]: '退回',
	[QueryState.Transfer]: '转单',
	[QueryState.Error]: '异常',
};
