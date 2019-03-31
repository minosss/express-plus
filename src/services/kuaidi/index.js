import kuaidi100 from './kuaidi100';
import baidu from './baidu';
import data from './data';

const groupBy = (arr, fn) =>
  arr
    .map(typeof fn === 'function' ? fn : val => val[fn])
    .reduce((acc, val, i) => {
      acc[val] = (acc[val] || []).concat(arr[i]);
      return acc;
    }, {});

const mapBy = (arr, fn) =>
  arr
    .map(typeof fn === 'function' ? fn : val => val[fn])
    .reduce((acc, val, i) => {
      acc[val] = arr[i];
      return acc;
    }, {});

const stableSort = (arr, compare) =>
  arr
    .map((item, index) => ({item, index}))
    .sort((a, b) => compare(a.item, b.item) || a.index - b.index)
    .map(({item}) => item);

export const codeMap = mapBy(data, 'code');

const sotrtedData = stableSort(data, (a, b) => (a.code > b.code ? 1 : -1));
export const groupedCodeMap = groupBy(sotrtedData, val => val.code[0]);

export default [kuaidi100, baidu];
