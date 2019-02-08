const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const getCacheIdentifier = require('react-dev-utils/getCacheIdentifier');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
// Const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const paths = require('./utils/paths');

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

const isDev = process.env.NODE_ENV === 'development';
const publicPath = isDev ? '/' : '/';

function getStyleLoaders(cssOptions, preProcessor) {
  const loaders = [
    // Creates style nodes from JS strings
    isDev ?
      {loader: 'style-loader'} :
      {
        loader: MiniCssExtractPlugin.loader,
        options: {}
      },
    // Translates CSS into CommonJS
    {
      loader: 'css-loader',
      options: cssOptions
    },
    {
      loader: 'postcss-loader',
      options: {
        ident: 'postcss',
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          require('postcss-preset-env')({
            autoprefixer: {
              flexbox: 'no-2009'
            },
            stage: 3
          })
        ],
        sourceMap: !isDev
      }
    }
  ].filter(Boolean);
  if (preProcessor) {
    loaders.push({
      loader: preProcessor,
      options: {
        sourceMap: !isDev,
        javascriptEnabled: true
      }
    });
  }

  return loaders;
}

const env = {
  PUBLIC_URL: publicPath.slice(0, -1)
};

const entry = {
  popup: [
    isDev && path.resolve(__dirname, 'utils/webpackHotDevClient'),
    paths.platformPopupJs
  ].filter(Boolean),
  background: [
    isDev && path.resolve(__dirname, 'utils/webpackHotDevClient'),
    paths.platformBackgroundJs
  ].filter(Boolean)
};

const config = {
  mode: isDev ? 'development' : 'production',
  bail: !isDev,
  devtool: isDev ? 'eval-source-map' : 'source-map',
  entry,
  output: {
    path: paths.appBuild,
    pathinfo: isDev,
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js',
    hotUpdateChunkFilename: 'update/[id].[hash].hot-update.js',
    hotUpdateMainFilename: 'update/[hash].hot-update.json',
    publicPath,
    globalObject: 'this'
  },
  resolve: {
    modules: ['node_modules', paths.appSrc],
    extensions: ['.jsx', '.js', '.json'],
    alias: {
      '@': paths.appSrc,
      // 避免打包全部的图标，打包小了一半
      '@ant-design/icons/lib/dist$': path.resolve(__dirname, './src/icons.js')
    },
    plugins: [
      // 阻止引入 src 以外的文件
      new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson])
    ]
  },
  module: {
    strictExportPresence: true,
    rules: [
      // Disable require.ensure as it's not a standard language feature.
      {parser: {requireEnsure: false}},
      // TODO should I need run linter?
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        use: [
          'thread-loader',
          {
            loader: 'babel-loader',
            options: {
              customize: require.resolve('babel-preset-react-app/webpack-overrides'),
              babelrc: false,
              configFile: false,
              presets: ['babel-preset-react-app'],
              cacheIdentifier: getCacheIdentifier(
                isDev ? 'development' : 'production',
                ['babel-preset-react-app', 'react-dev-utils']
              ),
              plugins: [
                // 让 antd 可以按需求加载样式
                // ['import', {libraryName: 'antd', style: true}],
                // 装饰器
                // ['@babel/plugin-proposal-decorators', {legacy: true}],
                // 感觉不能设置到很完美更新，先不用，直接刷新页面
                // 'react-hot-loader/babel'
              ],
              cacheDirectory: true,
              cacheCompression: !isDev,
              compact: !isDev
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: cssRegex,
        exclude: cssModuleRegex,
        use: getStyleLoaders({
          importLoaders: 1,
          sourceMap: !isDev
        }),
        sideEffects: true
      },
      {
        // 为了更方便定义antd样式选用less
        test: lessRegex,
        exclude: lessModuleRegex,
        use: getStyleLoaders(
          {
            importLoaders: 1,
            sourceMap: !isDev
          },
          'less-loader'
        ),
        sideEffects: true
      }
    ]
  },
  plugins: [
    // 先清除发布目录
    new CleanWebpackPlugin([paths.appBuild]),
    // 根据入口文件需要生成多个 html
    ...Object.keys(entry).map(
      file =>
        new HtmlWebpackPlugin({
          inject: true,
          chunks: [file],
          template: path.resolve(paths.platformPath, `${file}.html`),
          filename: `${file}.html`
        })
    ),
    // New InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime~.+[.]js/]),
    // 替换 html 的参数，比如 %PUBLIC_URL%
    // require html-webpack-plugin 4.x
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, env),
    // 复制资源文件
    new CopyWebpackPlugin([{from: paths.platformAssets}]),
    new ModuleNotFoundPlugin(paths.appPath),
    //
    ...(isDev ? [
      new webpack.HotModuleReplacementPlugin(),
      // 避免输入错误的路径
      new CaseSensitivePathsPlugin(),
      new WatchMissingNodeModulesPlugin(paths.appNodeModules)
    ] : [
      // 生产模式取出样式到独立文件
      new MiniCssExtractPlugin({
        filename: 'css/[name].css',
        chunkFilename: 'css/[name].chunk.css'
      })
    ]),
    // 过滤moment资源缩小体积
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ],
  optimization: {
    minimize: !isDev,
    minimizer: [
      // This is only used in production mode
      new TerserPlugin({
        terserOptions: {
          parse: {
            // We want terser to parse ecma 8 code. However, we don't want it
            // to apply any minfication steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending futher investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2
          },
          mangle: {
            safari10: true
          },
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            // eslint-disable-next-line camelcase
            ascii_only: true
          }
        },
        // Use multi-process parallel running to improve the build speed
        // Default number of concurrent runs: os.cpus().length - 1
        parallel: true,
        // Enable file caching
        cache: true,
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          parser: safePostCssParser,
          map: {
            // `inline: false` forces the sourcemap to be output into a
            // separate file
            inline: false,
            // `annotation: true` appends the sourceMappingURL to the end of
            // the css file, helping the browser find the sourcemap
            annotation: true
          }
        }
      })
    ],
    splitChunks: {
      chunks: 'all',
      name: false
    },
    runtimeChunk: true
  },
  node: {
    module: 'empty',
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    // eslint-disable-next-line camelcase
    child_process: 'empty'
  }
};

module.exports = config;
