import ky from 'ky';

const api = ky.extend({
  prefixUrl: 'https://restapi.amap.com/v3',
  searchParams: {
    key: process.env.APP_AMAP_KEY || ''
  }
});

export const inputtips = async ({keywords}) => {
  const data = await api
    .get('assistant/inputtips', {
      searchParams: {
        keywords
      }
    })
    .json();

  return data;
};
