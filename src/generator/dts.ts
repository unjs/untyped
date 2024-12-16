import { genObjectKey } from "knitwork";
import type { Schema, JSType, TypeDescriptor } from "../types";
import { normalizeTypes } from "../utils";

export interface GenerateTypesOptions {
  interfaceName?: string;
  addExport?: boolean;
  addDefaults?: boolean;
  defaultDescription?: string;
  indentation?: number;
  allowExtraKeys?: boolean;
  partial?: boolean;
}

const GenerateTypesDefaults: GenerateTypesOptions = {
  interfaceName: "Untyped",
  addExport: true,
  addDefaults: true,
  allowExtraKeys: undefined,
  partial: false,
  indentation: 0,
};

const TYPE_MAP: Record<JSType, string> = {
  array: "any[]",
  bigint: "bigint",
  boolean: "boolean",
  number: "number",
  object: "", // Will be precisely defined
  any: "any",
  string: "string",
  symbol: "Symbol",
  function: "Function",
};

const SCHEMA_KEYS = new Set([
  "items",
  "default",
  "resolve",
  "properties",
  "title",
  "description",
  "$schema",
  "type",
  "tsType",
  "markdownType",
  "tags",
  "args",
  "id",
  "returns",
]);

const DECLARATION_RE =
  /typeof import\(["'](?<source>[^)]+)["']\)(\.(?<type>\w+)|\[["'](?<type1>\w+)["']])/g;

function extractTypeImports(declarations: string) {
  const typeImports: Record<string, Set<string>> = {};
  const aliases = new Set<string>();
  const imports = [];
  for (const match of declarations.matchAll(DECLARATION_RE)) {
    const { source, type1, type = type1 } = match.groups || {};
    typeImports[source] = typeImports[source] || new Set();
    typeImports[source].add(type);
  }
  for (const source in typeImports) {
    const sourceImports = [];
    for (const type of typeImports[source]) {
      let count = 0;
      let alias = type;
      while (aliases.has(alias)) {
        alias = `${type}${count++}`;
      }
      aliases.add(alias);
      sourceImports.push(alias === type ? type : `${type} as ${alias}`);
      declarations = declarations.replace(
        new RegExp(
          `typeof import\\(['"]${source}['"]\\)(\\.${type}|\\[['"]${type}['"]\\])`,
          "g",
        ),
        alias,
      );
    }
    imports.push(
      `import type { ${sourceImports.join(", ")} } from '${source}'`,
    );
  }
  return [...imports, declarations].join("\n");
}

export function generateTypes(schema: Schema, opts: GenerateTypesOptions = {}) {
  opts = { ...GenerateTypesDefaults, ...opts };
  const baseIden = " ".repeat(opts.indentation || 0);
  const interfaceCode =
    `interface ${opts.interfaceName} {\n` +
    _genTypes(schema, baseIden + " ", opts)
      .map((l) => (l.trim().length > 0 ? l : ""))
      .join("\n") +
    `\n${baseIden}}`;
  if (!opts.addExport) {
    return baseIden + interfaceCode;
  }
  return extractTypeImports(baseIden + `export ${interfaceCode}`);
}

function _genTypes(
  schema: Schema,
  spaces: string,
  opts: GenerateTypesOptions,
): string[] {
  const buff: string[] = [];

  if (!schema) {
    return buff;
  }

  for (const key in schema.properties) {
    const val = schema.properties[key] as Schema;
    buff.push(...generateJSDoc(val, opts));
    if (val.tsType) {
      buff.push(
        `${genObjectKey(key)}${isRequired(schema, key, opts) ? "" : "?"}: ${
          val.tsType
        },\n`,
      );
    } else if (val.type === "object") {
      buff.push(
        `${genObjectKey(key)}${isRequired(schema, key, opts) ? "" : "?"}: {`,
        ..._genTypes(val, spaces, opts),
        "},\n",
      );
    } else {
      let type: string;
      if (val.type === "array") {
        type = `Array<${getTsType(val.items || [], opts)}>`;
      } else if (val.type === "function") {
        type = genFunctionType(val, opts);
      } else {
        type = getTsType(val, opts);
      }
      buff.push(
        `${genObjectKey(key)}${
          isRequired(schema, key, opts) ? "" : "?"
        }: ${type},\n`,
      );
    }
  }

  if (buff.length > 0) {
    const last = buff.pop() || "";
    buff.push(last.slice(0, Math.max(0, last.length - 1)));
  }

  if (
    opts.allowExtraKeys === true ||
    (buff.length === 0 && opts.allowExtraKeys !== false)
  ) {
    buff.push("[key: string]: any");
  }

  return buff.flatMap((l) => l.split("\n")).map((l) => spaces + l);
}

function getTsType(
  type: TypeDescriptor | TypeDescriptor[],
  opts: GenerateTypesOptions,
): string {
  if (Array.isArray(type)) {
    return (
      [normalizeTypes(type.map((t) => getTsType(t, opts)))].flat().join("|") ||
      "any"
    );
  }
  if (!type) {
    return "any";
  }
  if (type.tsType) {
    return type.tsType;
  }
  if (!type.type) {
    return "any";
  }
  if (Array.isArray(type.type)) {
    return type.type
      .map((t) => {
        // object is typed to an empty string by default, we need to type as object
        if (t === "object" && type.type!.length > 1) {
          return `{\n` + _genTypes(type, " ", opts).join("\n") + `\n}`;
        }
        return TYPE_MAP[t];
      })
      .join("|");
  }
  if (type.type === "array") {
    return `Array<${getTsType(type.items || [], opts)}>`;
  }
  if (type.type === "object") {
    return `{\n` + _genTypes(type, " ", opts).join("\n") + `\n}`;
  }
  return TYPE_MAP[type.type] || type.type;
}

export function genFunctionType(schema: Schema, opts: GenerateTypesOptions) {
  return `(${genFunctionArgs(schema.args, opts)}) => ${getTsType(
    schema.returns || [],
    opts,
  )}`;
}

export function genFunctionArgs(
  args: Schema["args"],
  opts: GenerateTypesOptions,
) {
  return (
    args
      ?.map((arg) => {
        let argStr = arg.name;
        if (arg.optional || arg.default) {
          argStr += "?";
        }
        if (arg.type || arg.tsType) {
          argStr += `: ${getTsType(arg, opts)}`;
        }
        return argStr;
      })
      .join(", ") || ""
  );
}

function generateJSDoc(schema: Schema, opts: GenerateTypesOptions): string[] {
  // TODO: remove when appropriate
  // @ts-expect-error - legacy typo
  opts.defaultDescription = opts.defaultDescription || opts.defaultDescrption;

  let buff = [];

  if (schema.title) {
    buff.push(schema.title, "");
  }

  if (schema.description) {
    buff.push(schema.description, "");
  } else if (opts.defaultDescription && schema.type !== "object") {
    buff.push(opts.defaultDescription, "");
  }

  if (
    opts.addDefaults &&
    schema.type !== "object" &&
    schema.type !== "any" &&
    !(Array.isArray(schema.default) && schema.default.length === 0)
  ) {
    const stringified = JSON.stringify(schema.default);
    if (stringified) {
      buff.push(`@default ${stringified.replace(/\*\//g, String.raw`*\/`)}`);
    }
  }

  for (const key in schema) {
    if (!SCHEMA_KEYS.has(key)) {
      buff.push("", `@${key} ${schema[key as keyof Schema] as string}`);
    }
  }

  if (Array.isArray(schema.tags)) {
    for (const tag of schema.tags) {
      if (tag !== "@untyped") {
        buff.push("", tag);
      }
    }
  }

  // Normalize new lines in values
  buff = buff.flatMap((i) => i.split("\n"));

  if (buff.length > 0) {
    return buff.length === 1
      ? ["/** " + buff[0] + " */"]
      : ["/**", ...buff.map((i) => ` * ${i}`), "*/"];
  }

  return [];
}

function isRequired(schema: Schema, key: string, opts: GenerateTypesOptions) {
  if (Array.isArray(schema.required) && schema.required.includes(key)) {
    return true;
  }
  return !opts.partial;
}
