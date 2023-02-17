import './install';
import './uninstall';
import './web-request';
import './alarm';
import './message';
import './message-external';

declare global {
	// hide the error: chrome not found
	const chrome: any;
}

let installed = false;
export function createKuaidiDocument() {
	if (installed) return;

	installed = true;

	try {
		chrome.offscreen.createDocument({
			url: 'offscreen.html',
			reasons: ['IFRAME_SCRIPTING'],
			justification: 'fake_client_inject',
		});
	} catch {
		//
	}
}

//
createKuaidiDocument();
