const {createConfig} = require('@yme/webpack-core');
const less = require('@yme/webpack-less');
const react = require('@yme/webpack-react');
const extension = require('@yme/webpack-extension');
const file = require('@yme/webpack-file');

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

module.exports = config.toConfig();
