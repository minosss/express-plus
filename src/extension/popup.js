import React from 'react';
import {render} from 'react-dom';
import {Router, LocationProvider, createMemorySource, createHistory} from '@reach/router';

import Launch from './Launch';
import App from './App';
import api from './api';
import AppProvider from '@/shared/components/Provider/Provider';
import createHashSource from '@/shared/utils/createHashSource';
import './styles.less';

let source = createHashSource('/');
let history = createHistory(source);

const LaunchApp = () => {
	return (
		<LocationProvider history={history}>
			<AppProvider value={{api}}>
				<Router className='app-container'>
					<Launch path='/' />
					<App path='/app/*' />
				</Router>
			</AppProvider>
		</LocationProvider>
	);
};

render(<LaunchApp />, document.getElementById('root'));
