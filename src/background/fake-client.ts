const latestRefresh = 0;
export async function refreshCookies(force = false) {
	const frame = (window.frames as any)['kuaidi'];
	if (!frame) {
		throw new Error('iframe (kuaidi) not found');
	}

	const diff = Date.now() - latestRefresh;
	if (!force || diff < 720_000) {
		return latestRefresh;
	}

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
					},
					{once: true}
				);
			},
			{once: true}
		);
		frame.contentDocument.location.reload(true);
	});
}
