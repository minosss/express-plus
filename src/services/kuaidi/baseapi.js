import ky from 'ky';

export default class BaseApi {
  constructor(prefixUrl) {
    this.request = ky.extend({prefixUrl});
    this.exclude = [];
  }

  formatData(data) {
    return data;
  }
}
