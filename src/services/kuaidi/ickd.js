import BaseApi from './baseapi';

class Ickd extends BaseApi {
  constructor() {
    super('https://biz.trace.ickd.cn');
  }

  async auto(postId) {
    const data = await this.request
      .get('auto.php', {
        searchParams: {
          mailNo: postId
        }
      })
      .json();

    return data.coms.map(item => ({comCode: item.com})) || [];
  }

  async query(postId, type) {
    const data = await this.request.get(`${type}/${postId}`).json();

    return this.formatData(data);
  }

  formatData(rawData) {
    const {
      status: state,
      message,
      errCode,
      data,
      mailNo: postId,
      expSpellName: type
    } = rawData;
    if (errCode !== 0) {
      throw new Error(message);
    }

    return {
      postId,
      type,
      // ickd最新的在最后面
      data: data.reverse(),
      state: String(state)
    };
  }
}

const api = new Ickd();
export default api;
