import React from 'react';
import {render} from 'react-dom';
import {SWRConfig} from 'swr';

import App from './App';
import {fetcher} from './utils';

// 分开避免每次都编译 antd 的样式
import '@/shared/styles/ui.less';
import '@/shared/styles/yme.less';

render(
	<SWRConfig
		value={{
			shouldRetryOnError: false,
			// 窗口获取焦点时不重新请求
			revalidateOnFocus: false,
			// 数据操作全部由背景页面处理
			fetcher,
		}}
	>
		<App />
	</SWRConfig>,
	document.querySelector('#root')
);
