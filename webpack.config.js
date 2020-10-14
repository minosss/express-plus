const {createConfig} = require('@yme/webpack-core');
const less = require('@yme/webpack-less');
const react = require('@yme/webpack-react');
const extension = require('@yme/webpack-extension');
const file = require('@yme/webpack-file');

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

if (env.isEnvDevelopment) {
	config.plugin('react-refresh').tap(() => [
		{
			overlay: {
				entry: require.resolve('react-dev-utils/webpackHotDevClient'),
				module: require.resolve('./refreshOverlayInterop'),
				sockIntegration: false,
			},
		},
	]);

	// config.node.set('global', false);
}

config.optimization.minimizer('js').tap(([options]) => {
	// remove comments
	return [{...options, extractComments: false}];
});

console.log(config.toConfig().optimization.minimizer);
module.exports = config.toConfig();
