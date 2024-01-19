import { describe, it, expect } from "vitest";
import { resolveSchema, generateTypes } from "../src";

describe("resolveSchema", () => {
  it("basic", async () => {
    const types = generateTypes(
      await resolveSchema({
        test: {
          foo: {
            $default: "test value",
            $schema: {
              title: "Test",
              description: "this is test",
            },
          },
        },
      }),
    );
    expect(types).toMatchInlineSnapshot(`
      "export interface Untyped {
       test: {
        /**
         * Test
         * 
         * this is test
         * 
         * @default "test value"
        */
        foo: string,
       },
      }"
    `);
  });
  it("withOptions", async () => {
    const types = generateTypes(
      await resolveSchema({
        test: {
          a: 123,
          foo: { bar: 123, baz: { x: 123 } },
        },
      }),
      { partial: true, addDefaults: false, addExport: false },
    );
    expect(types).toMatchInlineSnapshot(`
      "interface Untyped {
       test?: {
        a?: number,

        foo?: {
         bar?: number,

         baz?: {
          x?: number,
         },
        },
       },
      }"
    `);
  });

  it("array", async () => {
    const types = generateTypes(
      await resolveSchema({
        empty: [],
        numbers: [1, 2, 3],
        mixed: [true, 123],
        object: [{ foo: [123] }],
        manual: {
          $schema: {
            type: "array",
            items: {
              type: "object",
              required: ["foo"],
              properties: {
                foo: {
                  type: "number",
                  description: "This is foo prop",
                },
                bar: {
                  type: "number",
                  description: "This is bar prop",
                },
              },
            },
          },
        },
      }),
      { partial: true },
    );

    expect(types).toMatchInlineSnapshot(`
      "export interface Untyped {
       empty?: Array<any>,

       /** @default [1,2,3] */
       numbers?: Array<number>,

       /** @default [true,123] */
       mixed?: Array<boolean|number>,

       /** @default [{"foo":[123]}] */
       object?: Array<{
        [key: string]: any
       }>,

       manual?: Array<{
        /**
         * This is foo prop
         * 
        */
        foo: number,

        /**
         * This is bar prop
         * 
        */
        bar?: number,
       }>,
      }"
    `);
  });

  it("escapeKey", async () => {
    const types = generateTypes(
      await resolveSchema({
        "*key": "123",
      }),
    );
    expect(types).toMatch('"*key": string');
  });

  it("functions", async () => {
    const types = generateTypes(
      await resolveSchema({
        add: {
          $schema: {
            type: "function",
            args: [
              {
                name: "test",
                type: "Array<string | number>",
                optional: true,
              },
              {
                name: "append",
                type: "boolean",
                tsType: "false",
                optional: true,
              },
            ],
          },
        },
      }),
    );

    expect(types).toBe(
      `
export interface Untyped {
 add: (test?: Array<string | number>, append?: false) => any,
}
`.trim(),
    );
  });

  it("extracts type imports to top-level", async () => {
    const types = generateTypes(
      await resolveSchema({
        test: {
          foo: {
            $schema: {
              tsType: 'typeof import("vue").VueConfig',
            },
          },
          bar: {
            $schema: {
              tsType: 'typeof import("vue")["VueConfig"]',
            },
          },
          baz: {
            $schema: {
              tsType: 'typeof import("vue").OtherImport',
            },
          },
          quf: {
            $schema: {
              tsType: 'typeof import("other-lib").VueConfig',
            },
          },
        },
      }),
    );
    expect(types).toMatchInlineSnapshot(`
      "import type { VueConfig, OtherImport } from 'vue'
      import type { VueConfig as VueConfig0 } from 'other-lib'
      export interface Untyped {
       test: {
        foo: VueConfig,

        bar: VueConfig,

        baz: OtherImport,

        quf: VueConfig0,
       },
      }"
    `);
  });

  it("array - literal and object entries", async () => {
    const schema = generateTypes(
      await resolveSchema({
        foo: { bar: ["first", "second", { third: true }] },
      }),
    );
    expect(schema).toMatchInlineSnapshot(`
      "export interface Untyped {
       foo: {
        /** @default ["first","second",{"third":true}] */
        bar: Array<string|{
         [key: string]: any
        }>,
       },
      }"
    `);
  });
});
