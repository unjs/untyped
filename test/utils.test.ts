import { describe, it, expect } from "vitest";
import { getValue, setValue } from "../src/utils";

describe("getValue", () => {
  it("handles inaccessible properties", () => {
    const fixture = {
      top: false,
      test: { other: false, thing: { value: "foo" } },
    };
    expect(getValue(fixture, "test.thing.value")).toBe("foo");
    expect(getValue(fixture, "test.other.value")).toBe(undefined);
    expect(getValue(fixture, "top.other.value")).toBe(undefined);
  });
});

describe("setValue", () => {
  it("handles inaccessible properties", () => {
    const fixture = { test: { other: false, thing: { value: "foo" } } };
    setValue(fixture, "test.thing.value", "bar");
    expect(fixture.test.thing.value).toBe("bar");
    setValue(fixture, "test.other.value", "ab");
    expect(fixture.test.other).toBe(false);
  });
});
