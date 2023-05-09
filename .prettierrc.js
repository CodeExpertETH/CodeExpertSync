module.exports = {
  ...require('@code-expert/prettier-config'),
  importOrder: ['<THIRD_PARTY_MODULES>', '^@code-expert/prelude$', '^@/', '^(/|.{0,2}/)', '^.$'],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
};
