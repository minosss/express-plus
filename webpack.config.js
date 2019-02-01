const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const TerserPlugin = require('terser-webpack-plugin');
// utils
// const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const getCacheIdentifier = require('react-dev-utils/getCacheIdentifier');
const paths = require('./utils/paths');

// resource regex
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const lessRegex = /\.less$/;
// const lessModuleRegex = /\.module\.less$/;
// const sassRegex = /\.(scss|sass)$/;
// const sassModuleRegex = /\.module\.(scss|sass)$/;

// env mode
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';
//
const publicPath = isProd ? '' : isDev && 'http://localhost:8080/';

function getStyleLoaders(cssOptions, preProcessor) {
  const loaders = [
    // creates style nodes from JS strings
    isDev && {loader: 'style-loader'},
    isProd && {
      loader: MiniCssExtractPlugin.loader,
      options: {},
    },
    // translates CSS into CommonJS
    {
      loader: 'css-loader',
      options: cssOptions,
    },
    // {
    //   loader: 'postcss-loader',
    //   options: {
    //     ident: 'postcss',
    //     plugins: () => [
    //       require('postcss-flexbugs-fixes'),
    //       require('postcss-preset-env')({
    //         autoprefixer: {
    //           flexbox: 'no-2009'
    //         },
    //         stage: 3
    //       })
    //     ],
    //     sourceMap: isProd
    //   }
    // },
  ].filter(Boolean);
  if (preProcessor) {
    loaders.push({
      loader: preProcessor,
      options: {
        sourceMap: isProd,
        javascriptEnabled: true,
      },
    });
  }
  return loaders;
}

const config = {
  mode: isProd ? 'production' : isDev && 'development',
  bail: isProd,
  devtool: isProd ? 'source-map' : isProd && 'eval-source-map',
  entry: {
    popup: [
      isDev && path.resolve(__dirname, 'utils/webpackHotDevClient'),
      paths.platformPopupJs,
    ].filter(Boolean),
    background: [
      isDev && path.resolve(__dirname, 'utils/webpackHotDevClient'),
      paths.platformBackgroundJs,
    ].filter(Boolean),
  },
  output: {
    path: isProd ? paths.appBuild : undefined,
    pathinfo: isDev,
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    publicPath: publicPath,
    globalObject: 'this',
  },
  devServer: {
    hot: true,
    contentBase: paths.appBuild,
    disableHostCheck: true,
  },
  resolve: {
    modules: ['node_modules', paths.appSrc],
    extensions: ['.jsx', '.js', '.json'],
    alias: {
      '@': paths.appSrc,
    },
  },
  module: {
    strictExportPresence: true,
    rules: [
      // Disable require.ensure as it's not a standard language feature.
      {parser: {requireEnsure: false}},
      // TODO should I need run linter?
      {
        test: /\.js$/,
        use: [
          'thread-loader',
          {
            loader: 'babel-loader',
            options: {
              customize: require.resolve(
                'babel-preset-react-app/webpack-overrides'
              ),
              babelrc: false,
              configFile: false,
              presets: ['babel-preset-react-app'],
              cacheIdentifier: getCacheIdentifier('development', [
                'babel-preset-react-app',
                'react-dev-utils',
              ]),
              plugins: [
                // 让 antd 可以按需求加载样式
                // ['import', {libraryName: 'antd', style: true}],
                // 装饰器
                // ['@babel/plugin-proposal-decorators', {legacy: true}],
              ],
              cacheDirectory: true,
              cacheCompression: false,
              compact: false,
            },
          },
        ],
        exclude: [/\/node_modules\//],
      },
      {
        test: cssRegex,
        exclude: cssModuleRegex,
        use: getStyleLoaders({
          importLoaders: 1,
          sourceMap: isProd,
        }),
        sideEffects: true,
      },
      {
        // 为了更方便定义antd样式选用less
        test: lessRegex,
        use: getStyleLoaders(
          {
            importLoaders: 1,
            sourceMap: isProd,
          },
          'less-loader'
        ),
        sideEffects: true,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['commons', 'popup'],
      template: './public/popup.html',
      filename: 'popup-auto.html',
      // template: '!!html-webpack-plugin/lib/loader.js!./public/popup.html',
    }),
    new ModuleNotFoundPlugin(paths.appPath),
    isDev && new webpack.HotModuleReplacementPlugin(),
    isDev && new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    isProd &&
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[name].chunk.css',
      }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ].filter(Boolean),
  optimization: {
    minimize: isProd,
    minimizer: [
      // This is only used in production mode
      new TerserPlugin({
        terserOptions: {
          parse: {
            // we want terser to parse ecma 8 code. However, we don't want it
            // to apply any minfication steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8,
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
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
        },
        // Use multi-process parallel running to improve the build speed
        // Default number of concurrent runs: os.cpus().length - 1
        parallel: true,
        // Enable file caching
        cache: true,
        sourceMap: true,
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
            annotation: true,
          },
        },
      }),
    ],
    splitChunks: {
      cacheGroups: {
        // 把共用的代码分离
        commons: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 2,
        },
      },
    },
  },
  node: {
    module: 'empty',
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
};

module.exports = config;
