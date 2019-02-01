/* eslint-disable */
require('shelljs/global');

const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

rm('-rf', 'build')
mkdir('build')
cp(`platform/chrome/manifest.${env}.json`, `build/manifest.json`)
cp('-R', 'platform/chrome/assets/*', 'build')
exec(`pug -O "{ env: '${env}' }" -o build platform/chrome/templates`)
