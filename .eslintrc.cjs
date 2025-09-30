module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
  ],
  settings: { react: { version: 'detect' } },
  env: { browser: true, es2022: true, node: true },
  ignorePatterns: ['dist', 'release', 'models', 'portable-build', 'portable-build/**', 'portable-build-new', 'portable-build-new/**'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  }
};