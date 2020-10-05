const {createConfig} = require('@yme/webpack-core');
const less = require('@yme/webpack-less');
const react = require('@yme/webpack-react');
const extension = require('@yme/webpack-extension');
const file = require('@yme/webpack-file');
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');

const {config, env} = createConfig(
	less({
		less: {
			lessOptions: {
				javascriptEnabled: true,
			},
		},
	}),
	react({
		babel: {
			plugins: [
				// emotion
				require.resolve('babel-plugin-emotion'),
			],
		},
	}),
	file(),
	extension({
		entries: [
			{
				name: 'main',
				src: './src/extension/main.js',
				template: './src/extension/main.html',
			},
			{
				name: 'background',
				src: './src/extension/background.js',
				template: './src/extension/background.html',
			},
		],
		copy: {patterns: [{from: './src/extension/assets'}]},
	})
);

const host = env.raw.HOST || 'localhost';
const sockHost = env.raw.WDS_SOCKET_HOST;
const sockPath = env.raw.WDS_SOCKET_PATH;
const sockPort = env.raw.WDS_SOCKET_PORT;

config.plugin('react-refresh').tap(() => [
	{
		overlay: {
			entry: require.resolve('react-dev-utils/webpackHotDevClient'),
			module: require.resolve('./refreshOverlayInterop'),
			sockIntegration: false,
		},
	},
]);

config.devServer.set('injectClient', false);
config.devServer.set('transportMode', 'ws');
config.devServer
	.clientLogLevel('none')
	.host(host)
	.sockHost(sockHost)
	.sockPath(sockPath)
	.sockPort(sockPort)
	.overlay(false)
	.before((app, server) => {
		app.use(evalSourceMapMiddleware(server));
		app.use(errorOverlayMiddleware());
	});

// config.node.set('global', false);
config.devtool('eval-cheap-source-map');

module.exports = config.toConfig();
