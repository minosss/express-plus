/** @jsx jsx */
import {HashRouter as Router, Switch, Route, Redirect, useLocation} from 'react-router-dom';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {jsx} from '@emotion/react';
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
import Histories from './Histories';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

const TransitionRoutes = () => {
	const location = useLocation();

	return (
		<TransitionGroup className='page-wapper'>
			<CSSTransition key={location.pathname} timeout={300} classNames='page'>
				<Switch location={location}>
					<Route path='/app/favorites' component={Favorites} />
					<Route path='/app/settings' component={Settings} />
					<Route path='/app/detail' component={Detail} />
					<Route path='/app/select' component={TypeOptions} />
					<Route path='/app/histories' component={Histories} />
					<Redirect to='/app/favorites' />
				</Switch>
			</CSSTransition>
		</TransitionGroup>
	);
};

export default function App() {
	return (
		<ConfigProvider locale={zhCN}>
			<Router>
				<Layout
					css={{
						width: 460,
						height: 600,
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
							position: 'relative',
							marginTop: 64,
							overflow: 'hidden auto',

							'&::-webkit-scrollbar': {
								width: 4,
							},

							'&::-webkit-scrollbar-track': {
								background: 'rgba(0, 0, 0, 0.1)',
							},

							'&::-webkit-scrollbar-thumb': {
								background: 'rgba(0, 0, 0, 0.2)',
							},
						}}
					>
						<TransitionRoutes />
					</Layout.Content>
				</Layout>
			</Router>
		</ConfigProvider>
	);
}
