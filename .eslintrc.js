const prettier = require('@yme/prettier-config');

module.exports = {
	globals: {
		chrome: true,
	},
	extends: ['react-app', 'prettier'],
	plugins: ['prettier'],
	rules: {
		'prettier/prettier': ['warn', prettier],
	},
};
