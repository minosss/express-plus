/** @jsx jsx */
// import React from 'react';
import {HashRouter as Router, Switch, Route} from 'react-router-dom';
import {jsx} from '@emotion/core';
import {ConfigProvider, Layout} from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

import {Navbar} from './components';
import Favorites from './Favorites';
import Settings from './Settings';
import Detail from './Detail';
import TypeOptions from './TypeOptions';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

export default function App() {
	return (
		<ConfigProvider locale={zhCN}>
			<Router>
				<Layout
					css={{
						width: 460,
						height: 640,
						position: 'relative',
						background: '#fff',
					}}
				>
					<Layout.Header
						css={{
							background: '#fff',
							position: 'absolute',
							zIndex: 1,
							padding: '0 1rem',
							width: '100%',
							boxShadow: '0 2px 8px #f0f1f2',
						}}
					>
						<Navbar />
					</Layout.Header>
					<Layout.Content
						css={{
							marginTop: 64,
							overflow: 'hidden auto',
						}}
					>
						<Switch>
							<Route path='/app/favorites' component={Favorites} />
							<Route path='/app/settings' component={Settings} />
							<Route path='/app/detail' component={Detail} />
							<Route path='/app/select/:postId' component={TypeOptions} />
						</Switch>
					</Layout.Content>
				</Layout>
			</Router>
		</ConfigProvider>
	);
}
