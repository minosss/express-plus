module.exports = {
	extends: ['stylelint-config-prettier'],
	rules: {
		'at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: [
					// - tailwind -
					'tailwind',
					'apply',
					'variants',
					'responsive',
					'screen',
				],
			},
		],
		'declaration-block-trailing-semicolon': null,
		'no-descending-specificity': null,
		indentation: 'tab',
	},
};
