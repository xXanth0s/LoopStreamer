module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'linebreak-style': 'off',
    'arrow-parens': 'off',
    'lines-between-class-members': 'off',
    'no-plusplus': 'off',
    'class-methods-use-this': 'off',
    'function-paren-newline': 'off',
    'no-return-assign': 'off',
    'vue/script-indent': ['error', 2, { 'baseIndent': 2 }],
    'array-bracket-spacing': 'off'
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
    },
    {
      files: ['*.vue'],
      rules: {
        indent: 'off',
        'max-len': ["error", { "code": 140 }]
      }
    }
  ],
};
