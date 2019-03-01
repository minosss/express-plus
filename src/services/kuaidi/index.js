import kuaidi100 from './kuaidi100';
import data from './data';

export const codeMap = data.reduce((res, curr) => {
  if (curr.code) {
    res[curr.code] = curr;
  }

  return res;
}, {});

export const groupedCodeMap = data.reduce((result, curr) => {
  const char = curr.code[0];
  if (Array.isArray(result[char])) {
    result[char].push(curr);
  } else {
    result[char] = [curr];
  }

  return result;
}, {});

export default [kuaidi100];
