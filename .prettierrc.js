module.exports = {
  ...require('@code-expert/prettier-config'),
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
