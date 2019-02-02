const path = require('path');

const appDirectory = path.resolve(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const PLATFORM = 'chrome';
const resolvePlatform = relativePath =>
  path.resolve(appDirectory, 'platform', PLATFORM, relativePath);

module.exports = {
  appPackageJson: resolveApp('package.json'),
  appPath: resolveApp('.'),
  appSrc: resolveApp('src'),
  appIndexJs: resolveApp('src/index.js'),
  appNodeModules: resolveApp('node_modules'),
  appBuild: resolveApp('build'),
  platformPath: resolvePlatform('.'),
  platformSrc: resolvePlatform('src'),
  platformPopupJs: resolvePlatform('src/popup.js'),
  platformBackgroundJs: resolvePlatform('src/background.js'),
  platformAssets: resolvePlatform('assets'),
};
