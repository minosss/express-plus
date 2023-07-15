import fs from 'node:fs/promises';
import axios from 'axios';
import { load } from 'cheerio';
import patch from './patch.mjs';

const all = 'https://www.kuaidi100.com/all/';

async function main() {
  const { data: html } = await axios(all, {
    method: 'get',
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
    responseType: 'text',
  });

  const $ = load(html);
  const list = $('.column-list a').toArray().map((e) => {
    const $e = $(e);
    const name = $e.text();
    const url = $e.attr('href');
    // all/{kind}.shtml
    const kind = url.split('/').at(-1).split('.')[0];
    return [kind, { name, kind, url }];
  });

  console.log(`Found ${list.length} companies`);

  // unique by kind
  const data = [...new Map([...list, ...patch]).values()];

  console.log(`Unique ${data.length} companies`);

  // save to 'src/api/kuaidi-map.json'
  await fs.writeFile(
    new URL('../src/api/kuaidi-map.json', import.meta.url),
    JSON.stringify({ updatedAt: Date.now(), data }, null, 2),
  );

  console.log('Done');
}

await main();
