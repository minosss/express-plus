export interface AutoItem {
	kind: string;
	name: string;
	id: string;
}

export enum QueryState {
	InTransit = 0,
	Accepted,
	Question,
	Delivered,
	Reject,
	Delivering,
	Return,
	Transfer,
	Error = 999,
}

export interface QueryItem {
	id: string;
	kind: string;
	phone?: string;
	state: string;
	updatedAt: string;
	data: {context: string; time: string}[];
}

export interface QueryParams {
	phone?: string;
	id: string;
	kind: string;
}

export interface KuaidiClient {
	auto(id: string): Promise<AutoItem[]>;
	query(params: QueryParams): Promise<QueryItem>;
}
