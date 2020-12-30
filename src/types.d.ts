declare module 'webextension-polyfill' {
	interface EventListener {
		addListener: (fn: any, ...args) => void;
	}

	interface Runtime {
		id: string;
		onInstalled: EventListener;
		onMessage: EventListener;
		onMessageExternal: EventListener;
		onUpdateAvailable: EventListener;
		getManifest(): Record<string, any>;
		sendMessage<T = any>(extensionId: string, message: any): Promise<T>;
		sendMessage<T = any>(message: any): Promise<T>;
	}

	const runtime: Runtime;

	const alarms: {
		create: (name: string, options: any) => Promise<void>;
		clear: (name: string) => Promise<void>;
		onAlarm: EventListener;
	};

	const webRequest: {
		onBeforeSendHeaders: EventListener;
	};

	const notifications: {
		create: (options: any) => Promise<void>;
	};

	const storage: {
		local: {
			get: any;
		};
	};
}

type Fn = () => void;

interface Favorite {
	updatedAt: any;
}

interface Settings extends Record<string, any> {
	enableAuto: boolean;
	autoInterval: string;
	enableFilterDelivered: boolean;
	enableImport: boolean;
}

interface QueryParams {
	postId: string;
	type: string;
	phone?: string;
}

interface QueryResult {
	nu: string;
	com: string;
	state: string;
	data: any[];
	status: string;
	message?: string;
	error?: string;
}

interface AutoResult {
	autoDest?: any[];
	auto?: any[];
}
