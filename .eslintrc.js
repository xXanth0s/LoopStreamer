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
      parser: '@typescript-eslint/parser',
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
      'vue/script-indent': ['error', 2, { baseIndent: 2 }],
      'array-bracket-spacing': 'off',
      'max-len': [
        'error',
        {
          'code': 120,
          'tabWidth': 4,
          ignorePattern: 'Logger\.',
        }
      ],
      '@typescript-eslint/ban-ts-ignore': 'off',
      'import/prefer-default-export': 'off',
      'no-param-reassign': 'off',
      'implicit-arrow-linebreak': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'import/no-cycle': 'off',
      'arrow-body-style': 'off',
      'no-useless-constructor': 'off',
      'interface-name-prefix': 'off',
      'prefer-destructuring': ['error', {
        'array': false,
      }],
      indent: [
        'error',
        4,
        {
          SwitchCase: 1,
          FunctionDeclaration: {
            'parameters': 'first',
          },
          FunctionExpression: {
            'parameters': 'first',
          },
          MemberExpression: 'off',
          CallExpression: {
            arguments: 'first'
          },
          ImportDeclaration: 'first',
          ArrayExpression: 'first',
          ObjectExpression: 'first',
          VariableDeclarator: 'first'
        }
      ],
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
              'max-len': ['error', { code: 140 }],
            },
        },
      {
        files: ['*.js'],
        rules: {
          'no-unresolved': 'off',
          'no-var-requires': 'off',
        },
      },
      {
        files: ['*.saga.ts'],
        rules: {
          'consistent-return': 'off',
        },
      },
    ],
};
