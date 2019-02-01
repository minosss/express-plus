module.exports = {
  extends: ['react-app', 'plugin:prettier/recommended'],
  plugins: ['react-hooks'],
  rules: {
    'prettier/prettier': ['error', {
      // 两个空格缩进
      tabWidth: 2,
      useTabs: false,
      // 分号
      semi: true,
      // 单引豪
      singleQuote: true,
      jsxSingleQuote: true,
      // 多行情况下关闭符号另起一行
      jsxBracketSameLine: false,
      // Object, Array多行逗号
      trailingComma: 'es5',
      // 括号内容空格
      bracketSpacing: false,
      // 箭头函数参数必须括号
      arrowParens: 'avoid',
      endOfLine: 'lf'
    }],
    'react-hooks/rules-of-hooks': 'error',
    'no-return-await': 'error',
    'no-unused-vars': [
			'error',
			{
				vars: 'all',
				args: 'after-used',
				ignoreRestSiblings: true,
				argsIgnorePattern: '^_$',
				caughtErrors: 'all',
				caughtErrorsIgnorePattern: '^_$'
			}
		],
  }
}
