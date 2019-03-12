import browser from 'webextension-polyfill';

export const getExtensionVersion = () => browser.runtime.getManifest().version;

export const reportIssue = () => {
  let url = 'https://github.com/minosss/express-plus/issues/new?title=&body=';

  try {
    const version = getExtensionVersion();
    const body = `


<!-- 请在上面留言 -->
快递助手 ${version}
${navigator.userAgent}`;

    url += encodeURIComponent(body);
  } catch (_) {
  }

  window.open(url);
};
