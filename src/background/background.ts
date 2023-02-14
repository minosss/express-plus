import './install';
import './uninstall';
import './web-request';
import './alarm';
import './message';
import './message-external';

let installed = false;
export function createKuaidiDocument() {
	if (installed) return;

	installed = true;

	chrome.offscreen.createDocument({
		url: 'offscreen.html',
		reasons: ['IFRAME_SCRIPTING'],
		justification: 'fake_client_inject',
	});
}

//
createKuaidiDocument();
