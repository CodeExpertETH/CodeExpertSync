const testFiles = [
  'tests/**/*.[jt]s',
  '**/*.arb.[jt]s',
  '**/*.stories.[jt]sx',
  '**/*.tests.[jt]s',
  '**/*.tests.[jt]sx',
  '**/testHooks.ts',
  '**/__tests__/*.[jt]s',
];

const testUtilFiles = ['**/utils/test/**'];

const noRestrictedImportsBase = [
  {
    group: ['**/index'],
    message: "Use directory imports without trailing '/index'.",
  },
  {
    group: ['**/prelude/**'],
    message: 'Only import from module root.',
  },
  {
    group: ['antd/lib/**'],
    message: "Only import Antd modules from 'antd/es/...'.",
  },
  {
    group: ['@fortawesome/**'],
    message: "Only import from 'import { Icon } from '/imports/ui/foundation/Icons'",
  },
];

const noRestrictedImportsTest = [
  {
    group: ['fast-check', './src/utils/test', './src/utils/test/**'],
    message: 'Only import in test files, never in the production bundle path.',
  },
];

const rules = {
  'import/named': 'off',
  'import/no-unresolved': 'off',
  'import/no-extraneous-dependencies': [
    'error',
    {
      devDependencies: [...testFiles, ...testUtilFiles],
    },
  ],
  'react-hooks/exhaustive-deps': [
    'warn',
    {
      additionalHooks: 'useAsync',
    },
  ],
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        ...noRestrictedImportsBase,
        ...noRestrictedImportsTest,
        {
          group: ['date-fns', 'date-fns/*', 'fp-ts', 'fp-ts-*', 'fp-ts/*', 'io-ts', 'io-ts-*'],
          message: "Import through 'prelude'.",
        },
      ],
    },
  ],
};

const overrides = [
  {
    files: ['./src/prelude/**', './src/utils/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [...noRestrictedImportsBase, ...noRestrictedImportsTest],
        },
      ],
    },
  },
  {
    files: testFiles,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...noRestrictedImportsBase,
            {
              group: ['fast-check'],
              message: 'Import through test/utils',
            },
          ],
        },
      ],
    },
  },
  {
    files: testUtilFiles,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [...noRestrictedImportsBase],
        },
      ],
    },
  },
];

module.exports = {
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  root: true,
  extends: [
    '@code-expert/prettier-typescript-react',
    'plugin:import/recommended',
    'plugin:storybook/recommended',
  ],
  rules,
  overrides,
};
