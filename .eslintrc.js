const project = ['./tsconfig.json', './src/tsconfig.json', './packages/*/tsconfig.json', "./packages/*/*/tsconfig.json"];

module.exports = {
  parserOptions: {
    tsconfigRootDir: __dirname,
    project,
    sourceType: 'module',
  },
  root: true,
  extends: [
    'plugin:import/typescript',
    '@code-expert/prettier-typescript-react',
    'plugin:import/recommended',
    'plugin:storybook/recommended',
  ],
  ignorePatterns: ['vite.config.*'],
  settings: {
    'import/resolver': {
      typescript: { project },
    },
  },
  rules: {
    'import/namespace': 'off',
    'import/named': 'off',
    'import/no-named-as-default-member': 'off',
  },
};
