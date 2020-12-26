const prettier = require('@yme/prettier-config');

module.exports = {
	globals: {
		chrome: true,
	},
	extends: ['react-app', 'prettier', 'prettier/react'],
	plugins: ['prettier', '@emotion'],
	rules: {
		'prettier/prettier': ['warn', prettier],
	},
};
