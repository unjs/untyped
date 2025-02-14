import { describe, it, expect } from "vitest";
import { loadSchema } from "../src/loader/loader";

describe("loader", () => {
  it("should load a schema", async () => {
    const schema = await loadSchema("./test/fixtures/config.ts", {});
    expect(schema).toMatchInlineSnapshot(`
      {
        "default": {
          "config": {
            "checked": false,
          },
        },
        "id": "#",
        "properties": {
          "config": {
            "default": {
              "checked": false,
            },
            "id": "#config",
            "properties": {
              "checked": {
                "default": false,
                "deprecated": "use unchecked",
                "description": "",
                "id": "#config/checked",
                "tags": [],
                "title": "checked status",
                "type": "boolean",
              },
            },
            "type": "object",
          },
        },
        "type": "object",
      }
    `);
  });

  it.only("should load a schema with", async () => {
    const schema = await loadSchema("./test/fixtures/functions.ts");
    expect(schema).toMatchInlineSnapshot(`
      {
        "default": {},
        "id": "#",
        "properties": {
          "main": {
            "args": [
              {
                "items": {},
                "name": "a",
                "tsType": "number",
                "type": "number",
              },
            ],
            "description": "",
            "id": "#main",
            "returns": {
              "tsType": "string",
              "type": "string",
            },
            "tags": [],
            "title": "",
            "type": "function",
          },
        },
        "type": "object",
      }
    `);
  });
});
