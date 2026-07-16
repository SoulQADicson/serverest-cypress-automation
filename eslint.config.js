const globals = {
  Cypress: 'readonly',
  cy: 'readonly',
  describe: 'readonly',
  it: 'readonly',
  expect: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly'
}

module.exports = [
  {
    ignores: ['node_modules/**', 'reports/**', 'cypress/screenshots/**', 'cypress/videos/**']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals, console: 'readonly', process: 'readonly', require: 'readonly', module: 'readonly' }
    },
    rules: {
      'eqeqeq': 'error',
      'no-undef': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error'
    }
  }
]
