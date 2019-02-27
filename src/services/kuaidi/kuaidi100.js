import BaseApi from './baseapi';

class Kuaidi100 extends BaseApi {
  constructor() {
    super('https://www.kuaidi100.com');
    this.name = 'kuaidi100';
  }

  async auto(postId) {
    const data = await this.request
      .get('autonumber/autoComNum', {
        searchParams: {
          resultv2: 1,
          text: postId
        }
      })
      .json();

    return data.autoDest || data.auto || [];
  }

  async query(postId, type) {
    const searchParams = {
      type,
      postid: postId,
      temp: Math.random()
    };

    if (type === 'shunfeng') {
      searchParams.phone = 1111;
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
