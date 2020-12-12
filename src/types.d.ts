declare module 'webextension-polyfill' {
	interface EventListener {
		addListener: (fn: any, ...args) => void;
	}

	const runtime: {
		id: string;
		onInstalled: EventListener;
		onMessage: EventListener;
		onMessageExternal: EventListener;
		onUpdateAvailable: EventListener;
	};

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

interface Settings extends Record<string, any> {}

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
