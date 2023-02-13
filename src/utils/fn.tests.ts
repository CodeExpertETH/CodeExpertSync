/* eslint-env mocha */
/* eslint-disable no-unused-expressions,max-classes-per-file */

import { assert, describe, it } from "vitest";
import * as fn from "./fn";
import { isNonEmptyRecord, isOneOf } from "./fn";
import fc from "fast-check";
import { pipe } from "../prelude";

describe("fn.js", () => {
  describe("difference", () => {
    it("should not show a difference when both arrays are the same", () => {
      assert.sameOrderedMembers(fn.difference([], []), []);
      assert.sameOrderedMembers(fn.difference([1, 2], [1, 2]), []);
    });
    it("should collect members that are missing in the second array", () => {
      assert.sameOrderedMembers(fn.difference([1, 2], []), [1, 2]);
      assert.sameOrderedMembers(fn.difference([1, 2], [1]), [2]);
    });
    it("should ignore members that are only in the second array", () => {
      assert.sameOrderedMembers(fn.difference([], [1]), []);
      assert.sameOrderedMembers(fn.difference([1, 2], [1, 2, 3]), []);
    });
  });

  describe("groupBy", () => {
    it("should group items by their key", () => {
      assert.deepEqual(
        fn.groupBy((x) => String(x.length), ["one", "two", "three"]),
        { 3: ["one", "two"], 5: ["three"] }
      );
    });
  });

  describe("isObject", () => {
    it("should reject null", () => {
      assert.isFalse(fn.isObject(null));
    });
    it("should reject undefined", () => {
      assert.isFalse(fn.isObject(undefined));
    });
    it("should reject number", () => {
      assert.isFalse(fn.isObject(1));
    });
    it("should reject string", () => {
      assert.isFalse(fn.isObject("a"));
    });
    it("should accept Number (object)", () => {
      // eslint-disable-next-line no-new-wrappers
      assert.isTrue(fn.isObject(new Number(0)));
    });
    it("should accept String (object)", () => {
      // eslint-disable-next-line no-new-wrappers
      assert.isTrue(fn.isObject(new String("a")));
    });
    it("should accept array", () => {
      assert.isTrue(fn.isObject([]));
    });
    it("should accept object", () => {
      assert.isTrue(fn.isObject({}));
    });
    it("should accept date", () => {
      assert.isTrue(fn.isObject(new Date()));
    });
    it("should accept regex", () => {
      assert.isTrue(fn.isObject(/./));
    });
  });

  describe("pick", () => {
    it("should not change anything when no keys are specified", () => {
      assert.deepEqual(fn.omit({ a: 1, b: 2, c: 3 }, []), { a: 1, b: 2, c: 3 });
    });
    it("should only keep the specified keys in the object", () => {
      assert.deepEqual(fn.pick({ a: 1, b: 2, c: 3 }, ["a", "b"]), {
        a: 1,
        b: 2,
      });
    });
    it("should ignore unknown keys", () => {
      // @ts-expect-error "d" is not a known key
      assert.deepEqual(fn.pick({ a: 1, b: 2, c: 3 }, ["d"]), {});
    });
  });

  describe("omit", () => {
    it("should not change anything when no keys are specified", () => {
      assert.deepEqual(fn.omit({ a: 1, b: 2, c: 3 }, []), { a: 1, b: 2, c: 3 });
    });
    it("should omit the specified keys in the object", () => {
      assert.deepEqual(fn.omit({ a: 1, b: 2, c: 3 }, ["a", "b"]), { c: 3 });
    });
    it("should ignore unknown keys", () => {
      // @ts-expect-error "d" is not a known key
      assert.deepEqual(fn.omit({ a: 1, b: 2, c: 3 }, ["d"]), {
        a: 1,
        b: 2,
        c: 3,
      });
    });
  });

  describe("removeUndefined", () => {
    it('should only keep properties where the value is not "undefined"', () => {
      assert.deepEqual(
        fn.removeUndefined({
          a: 0,
          b: undefined,
          c: null,
          d: { e: undefined },
        }),
        {
          a: 0,
          c: null,
          d: { e: undefined },
        }
      );
    });
  });

  describe("isNonEmptyRecord", () => {
    it("should reject nullish values", () => {
      assert.isFalse(isNonEmptyRecord(null));
      assert.isFalse(isNonEmptyRecord(undefined));
    });

    it("should reject empty objects", () => {
      assert.isFalse(isNonEmptyRecord({}));
    });

    it("should reject objects without enumerable properties", () => {
      class Class {
        [key: string]: string;

        constructor() {
          Object.defineProperty(this, "prop", {
            enumerable: false,
            value: "value",
          });
        }
      }
      const object = new Class();
      assert.strictEqual(object["prop"], "value");
      assert.isFalse(isNonEmptyRecord(object));
    });

    it("should reject objects without own properties", () => {
      class A {
        foo() {
          this["a"] = "a";
        }

        [key: string]: string | VoidFunction;
      }
      assert.isFalse(isNonEmptyRecord(new A()));
    });

    it("should accept objects with enumerable properties", () => {
      assert.isTrue(isNonEmptyRecord({ foo: "bar" }));
    });
  });

  describe("isOneOf", () => {
    const useVar = (..._: Array<unknown>) => {
      // ignore
    };

    it("should be equivalent to array.includes", () => {
      const prop = (allowed: Array<string>, input: string) =>
        allowed.includes(input) ===
        isOneOf(...(allowed as "a"[]))(input as "a");

      fc.assert(fc.property(fc.array(fc.string()), fc.string(), prop));
    });

    it("should narrow the needle's type", () => {
      const needle = "b" as "b" | "c";
      if (isOneOf("b")(needle)) {
        // this must work
        const b: "b" = needle;

        // @ts-expect-error not assignable
        const c: "c" = needle;

        useVar(b, c);
      }
    });

    it("should error if the haystack is not assignable to the needle", () => {
      const needle = "b" as const;

      // @ts-expect-error 'a' is not assignable to 'b'
      pipe(needle, isOneOf("a"));
      // @ts-expect-error 'a' is not assignable to 'b'
      isOneOf("a")(needle);

      // @ts-expect-error 'a' | 'b' is not assignable to 'b'
      pipe(needle, isOneOf("a", "b"));
      // @ts-expect-error 'a' | 'b' is not assignable to 'b'
      isOneOf("a", "b")(needle);
    });

    it("should error if the haystack is not a literal union", () => {
      const values = ["a", "b"] as Array<string>;
      // @ts-expect-error string is not assignable to 'b'
      isOneOf(...values);
    });
  });
});
