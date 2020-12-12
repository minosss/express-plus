const {createConfig, resolveApp} = require('@yme/webpack-core');
const less = require('@yme/webpack-less');
const react = require('@yme/webpack-react');
const extension = require('@yme/webpack-extension');
const file = require('@yme/webpack-file');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');

const {config} = createConfig(
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
				require.resolve('@emotion/babel-plugin'),
			],
		},
		useTs: true,
	}),
	file(),
	extension({
		entries: [
			{
				name: 'main',
				src: './src/extension/main.tsx',
				template: './src/extension/main.html',
			},
			{
				name: 'background',
				src: './src/extension/background.ts',
				template: './src/extension/background.html',
			},
		],
		copy: {patterns: [{from: './src/extension/assets'}]},
	})
);

config.resolve.alias.set('shared', resolveApp('src/shared'));

// config.plugin('ts').tap(() => [{async: true, silent: true, formatter: undefined}]);
config.plugins.delete('ts');
config.plugin('ts').use(ForkTsCheckerWebpackPlugin, [{async: true, silent: true}]);

module.exports = config.toConfig();
