import BaseApi from './baseapi';

class Kuaidi100 extends BaseApi {
  constructor() {
    super('https://www.kuaidi100.com');
    this.name = 'kuaidi100';
  }

  async deliver({latitude, longitude}) {
    const body = new URLSearchParams();
    body.append('latitude', latitude);
    body.append('longitude', longitude);
    body.append('apiversion', 11);
    body.append('platform', 'MWWW');

    const data = await this.request
      .post('apicenter/kdmkt.do', {
        body,
        prefixUrl: 'https://m.kuaidi100.com',
        searchParams: {
          method: 'queryMyMkt'
        }
      })
      .json();

    return data;
  }

  async auto({postId}) {
    const data = await this.request
      .post('autonumber/autoComNum', {
        searchParams: {
          resultv2: 1,
          text: postId
        }
      })
      .json();

    return data.autoDest || data.auto || [];
  }

  async query({postId, type, phone}) {
    const searchParams = {
      type,
      postid: postId,
      temp: Math.random(),
      phone: ''
    };

    if (type === 'shunfeng') {
      searchParams.phone = phone;
    }

    const data = await this.request
      .get('query', {
        searchParams
      })
      .json();

    return this.formatData(data);
  }

  formatData(rawData) {
    const {nu: postId, com: type, state, data, status, message} = rawData;
    if (status !== '200') {
      throw new Error(message);
    }

    return {
      postId,
      type,
      state,
      data
    };
  }
}

const api = new Kuaidi100();
export default api;
