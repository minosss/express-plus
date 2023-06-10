import './install';
import './web-request';
import './alarm';
import './message';
import './message-external';

declare global {
  // ignore the error: chrome not found
  const chrome: any;
}
