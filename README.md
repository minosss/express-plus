# 快递助手(Express+)

![](https://flat.badgen.net/badge/license/MIT/blue)
[![XO code style](https://flat.badgen.net/badge/code%20style/XO/5ed9c7)](https://github.com/xojs/xo)

## What is this?

本项目使用 `create-react-app` 创建，最初目的是使用 `react-scripts` 来处理打包问题。实际上，我需要在chrome的插件上访问资源，原有的功能无法实现这一点，需要自定义 webpack 配置打包。之前使用 vue 写到半路又转 react 纯属蛋疼，顺便用下 antd 和 hooks。再顺便尝试维护一个多端的项目如何。

在原有的结构目录下来定义配置，设置也尽量使用 CRA 的原有设置。

- `babel-preset-react-app` - Babel配置，而不自己导入 `@babel/env` 等
- ~~`eslint-config-react-app` - eslint配置，基础中加入 prettier~~
- `react-dev-utils` - 工具库，一些修改的在 `utils` 文件夹。比如 `webpackHotDevClient.js` 文件中，SockJS连接的 `webpack-dev-server` 地址无法自定义
- `react-dev-utils/InterpolateHtmlPlugin` - 替换 html 中的自定义参数，比如 `%PUBLIC_URL%`，需要安装 `html-webpack-plugin@next`，`InterpolateHtmlPlugin` 没有兼容3.x。
- `react-error-overlay` - 在 `webpackHotDevClient` 中使用，在发生错误的时候直接在 react 页面中显示，默认是添加了 `static/js/bundle.js` 的侦听

其它相关库

- `dayjs` 没有使用有关时间日期的组件，所以不用加载 `moment`
- `ky` 反正也不用支持低版本浏览器，直接使用 `ky` 比 `axios` 什么的小多了
- `immer` 用来做数据的脏检查更新
- ~~`html-webpack-harddisk-plugin` `html-webpack-plugin` 在 devServer 下是不会生成 html 文件到 publicPath 的，可插件加载的时候需要 html 文件，不能使用 http。~~
- ~~`write-file-webpack-plugin` 上面那个只把 html 写入到磁盘中，需要全部文件用这个，比如 `copy-webpack-plugin` 在 3.x 后已经不会在 devServer 下写入磁盘~~
- `webextension-polyfill` 统一 Chrome 和 Firefox 的请求，并且让 API 支持 Promise，方便用 `async/await`。
- `@ant-design/icons` 为了不全部打包图标文件，在 webpack 配置将图标路径指向到 `icons.js`，小了500KB

## Features

- 自动识别单号
- 自动查询更新信息
- 桌面提醒

## Screenshots

<div>
  <img src='./screenshots/1.png' width=280>
  <img src='./screenshots/2.png' width=280>
  <img src='./screenshots/3.png' width=280>
</div>

## Install

- Chrome: [![](https://flat.badgen.net/chrome-web-store/v/hghlokkgbicmblinhepcibacaiegldeg)][cws]
- Firefox: [![](https://flat.badgen.net/amo/v/express-plus)][amo]

## License

MIT, [License](LICENSE)

[cws]: https://chrome.google.com/webstore/detail/hghlokkgbicmblinhepcibacaiegldeg "Chrome Web Store"
[amo]: https://addons.mozilla.org/en-US/firefox/addon/express-plus/ "Firefox Add-ons"
