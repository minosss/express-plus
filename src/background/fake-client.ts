import {TheLastRefresh} from '../types';
import {log} from '../utils/log';

let latestRefresh = 0;
export async function refreshCookies(force = false) {
	const frame = (window.frames as any)['kuaidi'];
	if (!frame) {
		throw new Error('iframe (kuaidi) not found');
	}

	const diff = Date.now() - latestRefresh;

	log(`touch cookies: ${latestRefresh} in ${diff}`);

	// 15min
	if (!force && diff < 900_000) {
		return latestRefresh;
	}

	log(`refresh cookies`);

	return new Promise((resolve, reject) => {
		frame.addEventListener(
			'load',
			async () => {
				const kd = document.createElement('iframe');
				kd.src = 'https://m.kuaidi100.com/result.jsp';
				frame.contentDocument.body.append(kd);
				// 等里面的 iframe 加载完毕
				kd.addEventListener(
					'load',
					async () => {
						const now = Date.now();
						resolve(now);
						latestRefresh = now;
						log(`refresh done at ${now}`);
						localStorage.setItem(TheLastRefresh, `${now}`);
					},
					{once: true}
				);
			},
			{once: true}
		);
		frame.contentDocument.location.reload(true);
	});
}
