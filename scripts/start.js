process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', err => {
  throw err;
});

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk');
const clearConsole = require('react-dev-utils/clearConsole');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const {
  createCompiler,
  prepareUrls
} = require('react-dev-utils/WebpackDevServerUtils');
const paths = require('../utils/paths');
const webpackConfig = require('../webpack.config');

const port = parseInt(process.env.PORT, 10) || 3000;
const host = process.env.HOST || '0.0.0.0';
const isInteractive = process.stdout.isTTY;

async function start() {
  // 返回本地和当前网络的地址
  const urls = prepareUrls('http', host, port);
  // 获取app名称在输出信息中显示
  const appName = require(paths.appPackageJson).name;
  // 用 CRA 的工具创建 webpack 编译器
  const compiler = createCompiler(webpack, webpackConfig, appName, urls, true);
  // 准备运行开发服务器
  const devServer = new WebpackDevServer(compiler, {
    // 更新 CSS 可以直接热更新，更新 JS 会刷新整个页面
    // 添加了 react-hot-loader 支持组件热更新
    hot: true,
    contentBase: paths.appBuild,
    // WatchContentBase: true,
    // 关闭 host 的检测，在 chrome 中是在 chrome:// 下
    disableHostCheck: true,
    // 开启 gzip 压缩生成的文件
    compress: true,
    // 日志输出
    clientLogLevel: 'none',
    host,
    // PublicPath: '/',
    overlay: false,
    // 不输出打包日志
    quiet: true,
    // 在 webpack-dev-server 3.1.10 加入了这个设置，可以文件写入磁盘
    // https://webpack.js.org/configuration/dev-server/#devserver-writetodisk-
    writeToDisk: true,
    // Reportedly, this avoids CPU overload on some systems.
    // https://github.com/facebook/create-react-app/issues/293
    // src/node_modules is not ignored to support absolute imports
    // https://github.com/facebook/create-react-app/issues/1065
    watchOptions: {
      ignored: ignoredFiles(paths.appSrc)
    },
    before(app, server) {
      // This lets us fetch source contents from webpack for the error overlay
      app.use(evalSourceMapMiddleware(server));
      // This lets us open files from the runtime error overlay.
      app.use(errorOverlayMiddleware());

      // This service worker file is effectively a 'no-op' that will reset any
      // previous service worker registered for the same host:port combination.
      // We do this in development to avoid hitting the production cache if
      // it used the same host and port.
      // https://github.com/facebook/create-react-app/issues/2272#issuecomment-302832432
      app.use(noopServiceWorkerMiddleware());
    }
  });

  devServer.listen(port, host, err => {
    if (err) {
      return console.log(err);
    }

    if (isInteractive) {
      clearConsole();
    }

    console.log(chalk.cyan('Starting the development server...\n'));
  });

  ['SIGINT', 'SIGTERM'].forEach(sig => {
    process.on(sig, () => {
      devServer.close();
      process.exit();
    });
  });
}

start();
