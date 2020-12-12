interface MessageSender {
	frameId: number;
	id?: string;
	url?: string;
	origin?: string;
}

interface Alarm {
	name: string;
	scheduledTime: number;
	periodInMinutes?: number;
}

type ResourceType =
	| 'main_frame'
	| 'sub_frame'
	| 'stylesheet'
	| 'script'
	| 'image'
	| 'font'
	| 'object'
	| 'xmlhttprequest'
	| 'ping'
	| 'csp_report'
	| 'media'
	| 'websocket'
	| 'other';

interface HeaderDetails {
	requestHeaders: any[];
	url: string;
	method: string;
	type: ResourceType;
}

type OnInstalledReason = 'install' | 'update' | 'chrome_update' | 'shared_module_update';

interface InstalledDetails {
	reason: OnInstalledReason;
	previousVersion?: string;
	id?: string;
}
