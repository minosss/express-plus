const path = require('path');

const appDirectory = path.resolve(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const PLATFORM = 'extension';
const resolvePlatform = relativePath =>
  path.resolve(appDirectory, 'src/platform', PLATFORM, relativePath);

module.exports = {
  appPackageJson: resolveApp('package.json'),
  appPath: resolveApp('.'),
  appSrc: resolveApp('src'),
  appIndexJs: resolveApp('src/index.js'),
  appNodeModules: resolveApp('node_modules'),
  appBuild: resolveApp('build'),
  platformPath: resolvePlatform('.'),
  platformPopupJs: resolvePlatform('popup.js'),
  platformBackgroundJs: resolvePlatform('background.js'),
  platformAssets: resolvePlatform('assets')
};
