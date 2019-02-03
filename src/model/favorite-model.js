import dayjs from 'dayjs';

export default class FavoriteModel {
  update() {
    return this;
  }

  static placeholder() {
    return new FavoriteModel();
  }

  // 转到保存数据
  static fromObject(obj) {
    const {postId, type, state, data, tags} = obj;

    return Object.assign(this.placeholder(), {
      postId,
      type,
      state,
      lastestData:
        data && data.length > 0 ?
          {time: data[0].time, context: data[0].context} :
          {
            time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            context: '未查询到信息'
          },
      tags
    });
  }

  // 转换从接口来的数据
  static fromJson(json) {
    const {nu: postId, com: type, state, data, status, message} = json;
    if (status !== '200') {
      throw new Error(message);
    }

    return Object.assign(this.placeholder(), {
      postId,
      type,
      state,
      data
    });
  }
}
