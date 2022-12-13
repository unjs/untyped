import { describe, it, expect } from "vitest";
import { applyDefaults } from "../src";

describe("applyDefaults", () => {
  it("basic", async () => {
    const ref = {
      name: "default",
      empty: {},
      nested: {
        val: 1,
        list: {
          // eslint-disable-next-line unicorn/prefer-spread
          $resolve: (val) => ["a"].concat(val),
        },
      },
    };
    const input = {
      name: "custom",
      nested: {
        list: "b",
      },
    };

    const applied = await applyDefaults(ref, input);

    expect(applied).toMatchObject({
      name: "custom",
      empty: {},
      nested: {
        val: 1,
        list: ["a", "b"],
      },
    });

    expect(applied.empty).toMatchObject({});
  });
});
