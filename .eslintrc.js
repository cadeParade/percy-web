module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  env: {
    browser: true,
    es6: true,
  },
  plugins: ['prettier'],
  extends: ['prettier', 'eslint:recommended', 'plugin:ember/recommended'],
  parser: "babel-eslint",
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
        bracketSpacing: false,
        printWidth: 100,
      },
    ],
    'brace-style': ['error', '1tbs', {allowSingleLine: false}],
    'max-len': ['error', 100],
    'no-unused-expressions': 'error',
    'object-curly-spacing': ['error', 'never'],
    quotes: ['error', 'single', {avoidEscape: true}],
    'keyword-spacing': ['error', {before: true}],
    'space-in-parens': ['error', 'never'],
    semi: ['error', 'always'],
    'space-unary-ops': ['error', {nonwords: false}],
    'comma-dangle': ['error', 'always-multiline'],
    'no-unused-expressions': ["error", { "allowTernary": true }],
    'ember/no-new-mixins': 'off',
  },
  overrides: [
    {
      // chai uses some expressions like `to.be.ok` which are valid syntax
      // but get caught by this rule.
      files: '*-test.js',
      rules: {
        "no-unused-expressions": 'off'
      }
    }, {
      files: ['mirage/**'],
    }, {
      // node files
      files: [
        '.template-lintrc.js',
        'ember-cli-build.js',
        'tailwind.config.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/*/index.js',
      ],
    }
  ],
};
