// ==UserScript==
// @name         快递助手
// @namespace    https://github.com/minosss/express-plus
// @version      0.1
// @description  快速添加京东的物流信息到快递助手
// @author       Mino Zang
// @match        https://details.jd.com/normal/item.action?orderid=*
// @grant        none
// ==/UserScript==

(function () {
	function trackJD() {
		// 左边基本物流信息
		const li = document.querySelector('.track-lcol .p-info li:last-child');
		const reg = /(JD\d{13})/;
		if (li && reg.test(li.textContent)) {
			const match = reg.exec(li.textContent);
			// 确定有快递单号后获取最新的信息
			if (match && match.length > 0) {
				const date = document
					.querySelector('.track-list li.first .date')
					.textContent.split('/')[0];
				const time = document.querySelector('.track-list li.first .time').textContent;
				const content = document.querySelector('.track-list li.first .txt').textContent;

				console.log('express-plus: sending', match[0]);
				// 发送到插件收藏
				chrome.runtime.sendMessage(
					'hghlokkgbicmblinhepcibacaiegldeg',
					{
						type: 'import',
						data: {
							// 快递单号
							postId: match[0],
							// 更新时间
							updatedAt: date + ' ' + time,
							// 最新信息
							message: content,
							// 标签
							tags: [],
						},
					},
					function (res) {
						console.log('express-plus: success', res);
					}
				);
			}
		}
	}

	// 检测页面元素是否更新，物流信息会请求接口获取，需要等接口完成
	function handleObserver(mutationsList, observer) {
		for (const mutation of mutationsList) {
			if (mutation.type === 'childList') {
				trackJD();
			}
		}
	}
	const p = document.querySelector('.track-lcol .p-info');
	const observer = new MutationObserver(handleObserver);
	observer.observe(p, {childList: true, subtree: true});
})();
