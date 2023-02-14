import {runtime} from 'webextension-polyfill';

runtime.onInstalled.addListener((details) => {
	console.log('install extension');
});
