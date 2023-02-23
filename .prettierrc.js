module.exports = {
  ...require('@code-expert/prettier-config'),
  importOrder: ['<THIRD_PARTY_MODULES>', '^prelude/(.*)$', '^(/|.{0,2}/)', '^.$'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
