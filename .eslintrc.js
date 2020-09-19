const prettier = require('@yme/prettier-config');

module.exports = {
	extends: ['react-app', 'prettier'],
	plugins: ['prettier'],
	rules: {
		'prettier/prettier': ['warn', prettier],
	},
};
