module.exports = {
  ...require('@code-expert/prettier-config'),
  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
  importOrder: [
    'reset.css',
    '.css$',
    '<THIRD_PARTY_MODULES>',
    '^@code-expert/prelude$',
    '^@/',
    '^(/|.{0,2}/)',
    '^.$',
  ],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
};
