import dayjs from 'dayjs';
import BaseApi from './baseapi';

class Baidu extends BaseApi {
  constructor() {
    super('https://sp0.baidu.com/9_Q4sjW91Qh3otqbppnN2DJv/pae/channel/data');
    this.name = 'baidu';
  }

  async query({postId, type}) {
    const searchParams = {
      appid: '4001',
      com: type,
      nu: postId,
      vcode: '',
      token: '',
      _: Date.now()
    };

    const data = await this.request
      .get('asyncqury', {
        searchParams
      })
      .json();

    return this.formatData({postId, ...data});
  }

  formatData(rawData) {
    const {
      error_code: errorCode,
      msg,
      postId,
      data: {
        info: {com: type, state, context}
      }
    } = rawData;

    if (errorCode !== '0') {
      throw new Error(msg);
    }

    return {
      postId,
      type,
      state,
      data: context.map(c => ({
        time: dayjs.unix(c.time).format('YYYY-MM-DD HH:mm:ss'),
        context: c.desc
      }))
    };
  }
}

const api = new Baidu();
export default api;
