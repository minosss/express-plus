import pMap from 'p-map';
import pRetry from 'p-retry';
import FavoriteModel from '../model/favorite-model';
import StorageService from './storage-service';
import kuaidiApis, {codeMap} from './kuaidi';

// 状态码
export const STATE_IN_TRANSIT = '0';
export const STATE_ACCEPTED = '1';
export const STATE_DELIVERED = '3';
export const STATE_ERROR = '999';

export const stateMap = {
  [STATE_IN_TRANSIT]: '在途中', // In transit
  [STATE_ACCEPTED]: '已揽收', // Accepted
  2: '疑难',
  [STATE_DELIVERED]: '已签收', // Delivered
  4: '退签',
  5: '同城派送中',
  6: '退回',
  7: '转单',
  [STATE_ERROR]: '异常'
};

// API 结果
export const statusMap = {
  200: 'ok',
  604: '非法访问:IP禁止访问'
};

let updating = false;

function makeRetryApis(method) {
  const filteredApis = kuaidiApis.filter(
    api => api[method] && typeof api[method] === 'function'
  );

  let index = 0;
  const retryFn = async (...args) => {
    const api = filteredApis[index++];
    const data = await api[method](...args);
    return data;
  };

  return args => {
    index = 0;
    return pRetry(() => retryFn(args), {retries: filteredApis.length - 1});
  };
}

const retryAuto = makeRetryApis('auto');
const retryQuery = makeRetryApis('query');
const retryDeliver = makeRetryApis('deliver');

// 所有跟快递服务器相关的处理
export default class KuaidiService {
  static getCompanyName(code) {
    return codeMap[code] ? codeMap[code].name : code;
  }

  static getStateLabel(state) {
    return stateMap[state] || state;
  }

  static async deliver(params) {
    const data = await retryDeliver(params);
    return data;
  }

  /**
   * 自动识别
   * @param {string} postId 快递单号
   * @returns {array} 数组，返回可能的快递类型
   */
  static async auto(postId) {
    const data = await retryAuto({postId});
    return data;
  }

  /**
   * 查询快递
   * @param {object} params 查询参数
   * @param {boolean} saveHistory 保存记录
   * @returns {FavoriteModel} 收藏
   */
  static async query({postId, type, phone}, saveHistory = true) {
    try {
      const data = await retryQuery({postId, type, phone});
      data.updatedAt = Date.now();

      if (saveHistory) {
        StorageService.saveHistory(data);
      }

      return data;
    } catch (error) {
      return {postId, type, state: STATE_ERROR, message: error.message};
    }
  }

  // TODO 改为订阅形式，比如传入个callback或者可订阅快递的更新事件
  static async update() {
    if (updating) {
      return [];
    }

    updating = true;
    const favorites = await StorageService.getQueryFavorites();
    if (Array.isArray(favorites) && favorites.length > 0) {
      // -
      let messages = await pMap(
        favorites,
        async ({postId, type, phone, latestMessage, tags}) => {
          try {
            const result = await KuaidiService.query(
              {postId, type, phone},
              false
            );
            if (
              Array.isArray(result.data) &&
              result.data.length > 0 &&
              result.data[0].time !== latestMessage.time
            ) {
              const nextFavorite = FavoriteModel.fromObject(result);
              nextFavorite.tags = tags;
              // 更新已保存的快递
              await StorageService.updateFavorite(nextFavorite);
              return nextFavorite;
            }

            return null;
          } catch (_) {
            return null;
          }
        },
        {concurrency: 1}
      );

      messages = messages.filter(msg => msg !== null);

      // 是否开启过滤未签收快递
      if (await StorageService.shouldFilterDelivered()) {
        messages = messages.filter(msg => msg.state === '3');
      }

      updating = false;
      return messages;
    }

    updating = false;
    return [];
  }
}
