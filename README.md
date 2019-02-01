# 快递助手(Express+)

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## What is this?

本项目使用 `create-react-app` 创建，最初目的是使用 `react-scripts` 来处理打包问题。实际上，我需要在chrome的插件上访问资源，原有的功能无法实现这一点，需要自定义 webpack 配置打包。之前使用 vue 写到半路又转 react 纯属蛋疼，顺便用下 antd 和 hooks。再顺便尝试维护一个多端的项目如何。

在原有的结构目录下来定义配置，设置也尽量使用 CRA 的原有设置。

- `babel-preset-react-app` - Babel配置，而不自己导入 `@babel/env` 等
- `eslint-config-react-app` - eslint配置，基础中加入 prettier
- `react-dev-utils` - 工具库，一些修改的在 `utils` 文件夹。比如 `webpackHotDevClient.js` 文件中，SockJS连接的 `webpack-dev-server` 地址无法自定义

其它相关库

- `dayjs` 没有使用有关时间日期的组件，所以不用加载 `moment`
- `ky` 反正也不用支持低版本浏览器，直接使用 `ky` 比 `axios` 什么的小多了
- `immer` 用来做数据的脏检查更新

## Features

- [x] 0.1.x版本功能迁移 (0.2.x)
- [ ] 服务网点查询 (0.3.x)
- [ ] 寄件费用查询 (0.3.x)

## Install

- [Chrome Web Store](https://chrome.google.com/webstore/detail/hghlokkgbicmblinhepcibacaiegldeg)

## License

MIT, [License](LICENSE)
