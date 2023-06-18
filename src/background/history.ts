import type { QueryHistory } from '../types';

const STORE_KEY = 'histories';
const store = window.localStorage;

export function getHistories() {
  const histories = store.getItem(STORE_KEY);
  if (histories == null) {
    return [];
  }

  try {
    return JSON.parse(histories);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function addHistory(history: QueryHistory) {
  let histories = getHistories();
  // 只存 20 条记录，已快递单号为主
  histories = [
    history,
    ...histories.filter((item: QueryHistory) => item.id !== history.id),
  ].slice(0, 20);
  store.setItem(STORE_KEY, JSON.stringify(histories));
}

export function clearHistories() {
  store.removeItem(STORE_KEY);
}
