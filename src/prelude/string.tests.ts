/* eslint-disable no-restricted-imports */
import { assert, describe, it } from "vitest";
import fc from "fast-check";
import * as string from "./string";
import { identity, pipe } from "fp-ts/function";
import { array, monoid } from "fp-ts";

describe("string", () => {
  describe("isBlank", () => {
    it("should detect strings that contain only whitespace characters", () => {
      assert.isTrue(string.isBlank(""));
      assert.isTrue(string.isBlank(" "));
      assert.isFalse(string.isBlank("abc"));
      assert.isFalse(string.isBlank(" abc"));
    });

    it("should not change the outcome if whitespace is added", () => {
      const property = (str: string) =>
        string.isBlank(str) === string.isBlank(` ${str} `);
      fc.assert(fc.property(fc.string(), property));
    });
  });

  describe("join", () => {
    it("should be equivalent to array.intersperse", () =>
      fc.property(fc.string(), fc.array(fc.string()), (separator, as) =>
        assert.equal(
          pipe(as, monoid.concatAll(string.join(separator))),
          pipe(
            as,
            array.intersperse(separator),
            array.foldMap(string.Monoid)(identity)
          )
        )
      ));
  });
});
