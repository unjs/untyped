import { pascalCase } from "scule";
import type { Schema, JSType, TypeDescriptor, SchemaDefinition } from "./types";

export function defineUntypedSchema(options: SchemaDefinition) {
  return options;
}

export function escapeKey(val: string): string {
  return /^\w+$/.test(val) ? val : `"${val}"`;
}

export function getType(val: unknown): JSType | undefined {
  const type = typeof val;
  if (type === "undefined" || val === null) {
    return undefined;
  }
  if (Array.isArray(val)) {
    return "array";
  }
  return type;
}

export function isObject(val: unknown): boolean {
  return val !== null && !Array.isArray(val) && typeof val === "object";
}

export function nonEmpty<T>(arr: T[]): Array<NonNullable<T>> {
  return arr.filter(Boolean) as Array<NonNullable<T>>;
}

export function unique<T>(arr: T[]) {
  return [...new Set(arr)];
}

export function joinPath(a: string, b = "", sep = ".") {
  return a ? a + sep + b : b;
}

export function resolvePath(path: string, from: string) {
  return path.startsWith("/")
    ? resolveRelative(path)
    : resolveRelative(joinPath(from, path));
}

function resolveRelative(path: string) {
  const rSegments: string[] = [];
  for (const s of path.split(/[$./]/g)) {
    if (s === "..") {
      rSegments.pop();
    } else {
      rSegments.push(s);
    }
  }
  return "/" + rSegments.filter(Boolean).join("/");
}

export function setValue(obj: Record<string, any>, path: string, val: any) {
  const keys = path.split(".");
  const _key = keys.pop();
  for (const key of keys) {
    if (!obj || typeof obj !== "object") {
      return;
    }
    if (!(key in obj)) {
      obj[key] = {};
    }
    obj = obj[key];
  }
  if (_key) {
    if (!obj || typeof obj !== "object") {
      return;
    }
    obj[_key] = val;
  }
}

export function getValue<V = any>(obj: Record<string, any>, path: string) {
  for (const key of path.split(".")) {
    if (!obj || typeof obj !== "object" || !(key in obj)) {
      return;
    }
    obj = obj[key];
  }
  return obj as V;
}

export function getSchemaPath(schema: Schema, path: string) {
  for (const key of path.split(".")) {
    if (!schema.properties || !(key in schema.properties)) {
      return;
    }
    schema = schema.properties[key];
  }
  return schema;
}

export function mergedTypes(...types: TypeDescriptor[]): TypeDescriptor {
  types = types.filter(Boolean);
  if (types.length === 0) {
    return {};
  }
  if (types.length === 1) {
    return types[0];
  }
  const tsTypes = normalizeTypes(
    types.flatMap((t) => t.tsType).filter(Boolean)
  );
  return {
    type: normalizeTypes(types.flatMap((t) => t.type).filter(Boolean)),
    tsType: Array.isArray(tsTypes) ? tsTypes.join(" | ") : tsTypes,
    items: mergedTypes(...types.flatMap((t) => t.items).filter(Boolean)),
  };
}

export function normalizeTypes<T extends string>(val: T[]) {
  const arr = unique(val.filter(Boolean));
  if (arr.length === 0 || arr.includes("any" as any)) {
    return;
  }
  return arr.length > 1 ? arr : arr[0];
}

export function cachedFn(fn) {
  let val;
  let resolved = false;
  return () => {
    if (!resolved) {
      val = fn();
      resolved = true;
    }
    return val;
  };
}

const jsTypes: Set<JSType> = new Set([
  "string",
  "number",
  "bigint",
  "boolean",
  "symbol",
  "function",
  "object",
  "any",
  "array",
]);

export function isJSType(val: unknown): val is JSType {
  return jsTypes.has(val as any);
}

const FRIENDLY_TYPE_RE =
  /(typeof )?import\(["'](?<importName>[^"']+)["']\)(\[["']|\.)(?<firstType>[^\s"']+)(["']])?/g;

export function getTypeDescriptor(type: string | JSType): TypeDescriptor {
  if (!type) {
    return {};
  }

  let markdownType = type;
  for (const match of type.matchAll(FRIENDLY_TYPE_RE) || []) {
    const { importName, firstType } = match.groups || {};
    if (importName && firstType) {
      markdownType = markdownType.replace(
        match[0],
        pascalCase(importName) + pascalCase(firstType)
      );
    }
  }

  return {
    ...(isJSType(type) ? { type } : {}),
    tsType: type,
    ...(markdownType === type ? {} : { markdownType }),
  };
}
