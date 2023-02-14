export {};

export interface Track {
	id: string;
	kind: string;
	phone?: string;
	state: string;
	context?: string;
	updatedAt: string;
	createdAt: string;
	tags?: string[];
}

export type TrackList = Track[];

export interface History {
	id: string;
	kind: string;
	phone?: string;
}

export type HistoryList = History[];

export enum MessageKind {
	// data
	Track = 'track',
	GetTrack = 'get_track',
	DeleteTrack = 'delete_track',
	PutTrack = 'put_track',
	Settings = 'settings',
	PutSettings = 'post_settings',
	History = 'history',
	PutHistory = 'put_history',
	// api
	Auto = 'auto',
	Query = 'query',
	//
	RefreshCookies = 'refresh_cookies',
}

export interface ExtensionMessage {
	kind: MessageKind;
	data?: any;
}

export enum SettingsKind {
	EnableFilterDelivered = 'enableFilterDelivered',
	AutoInterval = 'autoInterval',
}

export type Settings = Record<SettingsKind, any>;
