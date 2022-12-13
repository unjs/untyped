import { describe, it, expect } from "vitest";
import { resolveSchema } from "../src";

describe("resolveSchema", () => {
  it("direct value", async () => {
    const schema = await resolveSchema({
      foo: "bar",
      empty: {},
    });
    expect(schema).toMatchObject({
      type: "object",
      properties: {
        foo: {
          type: "string",
          default: "bar",
        },
        empty: {
          type: "any",
          default: {},
        },
      },
    });
  });

  it("nested value", async () => {
    const schema = await resolveSchema({
      foo: { bar: 123 },
    });
    expect(schema).toMatchObject({
      properties: {
        foo: {
          type: "object",
          properties: {
            bar: {
              default: 123,
              type: "number",
            },
          },
        },
      },
    });
  });

  it("with $default", async () => {
    const schema = await resolveSchema({
      foo: { $default: "bar" },
    });
    expect(schema).toMatchObject({
      properties: {
        foo: {
          type: "string",
          default: "bar",
        },
      },
    });
  });

  it("with $schema", async () => {
    const schema = await resolveSchema({
      foo: { $schema: { title: "this is foo" } },
    });
    expect(schema).toMatchObject({
      properties: {
        foo: {
          title: "this is foo",
        },
      },
    });
  });

  it("with $resolve", async () => {
    const schema = await resolveSchema({
      foo: { $default: "123", $resolve: (val) => Number.parseInt(val) },
    });
    expect(schema).toMatchObject({
      properties: {
        foo: {
          default: 123,
          type: "number",
        },
      },
    });
  });

  it("with $resolve (dependency order-1)", async () => {
    const schema = await resolveSchema({
      foo: { $resolve: () => "foo" },
      bar: {
        $resolve: async (val, get) => (await get("foo")) + (val || "bar"),
      },
    });
    expect(schema).toMatchObject({
      properties: {
        bar: {
          default: "foobar",
        },
      },
    });
  });

  it("with $resolve (dependency order-2)", async () => {
    const schema = await resolveSchema({
      nested: {
        foo: {
          $resolve: async (val, get) => (await get("rootDir")) + (val || "bar"),
        },
      },
      rootDir: { $resolve: () => "root/" },
    });
    expect(schema).toMatchObject({
      properties: {
        rootDir: {
          type: "string",
          default: "root/",
        },
        nested: {
          properties: {
            foo: {
              type: "string",
              default: "root/bar",
            },
          },
        },
      },
    });
  });

  it("array", async () => {
    const schema = await resolveSchema({
      empty: [],
      numbers: [1, 2, 3],
      mixed: [true, 123],
      resolved: {
        $default: ["d"],
        // eslint-disable-next-line unicorn/prefer-spread
        $resolve: (val) => ["r"].concat(val),
      },
    });
    expect(schema).toMatchObject({
      properties: {
        empty: {
          type: "array",
          default: [],
          items: {
            type: "any",
          },
        },
        numbers: {
          type: "array",
          default: [1, 2, 3],
          items: {
            type: ["number"],
          },
        },
        mixed: {
          type: "array",
          default: [true, 123],
          items: {
            type: ["boolean", "number"],
          },
        },
        resolved: {
          default: ["r", "d"],
          type: "array",
          items: {
            type: ["string"],
          },
        },
      },
    });
  });
});
