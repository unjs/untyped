import type { Schema, JSType } from './types'

export function escapeKey (val: string): string {
  return /^\w+$/.test(val) ? val : `"${val}"`
}

export function getType (val: any): JSType | null {
  const type = typeof val
  if (type === 'undefined' || val === null) {
    return null
  }
  if (Array.isArray(val)) {
    return 'array'
  }
  return type
}

function genFunctionType (schema: Schema) {
  const args = schema.args.map((arg) => {
    let argStr = arg.name
    if (arg.optional) {
      argStr += '?'
    }
    if (arg.type) {
      argStr += ': ' + arg.type
    }
    if (arg.default) {
      argStr += ' = ' + arg.default
    }
    return argStr
  })

  return `(${args.join(', ')}) => {}`
}

export function isObject (val: any): boolean {
  return val !== null && !Array.isArray(val) && typeof val === 'object'
}

export function unique (arr: any[]) {
  return Array.from(new Set(arr))
}

export function joinPath (a, b = '', sep = '.') {
  return a ? a + sep + b : b
}

export function resolvePath (path: string, from: string) {
  return path.startsWith('/')
    ? resolveRelative(path)
    : resolveRelative(joinPath(from, path))
}

function resolveRelative (path: string) {
  const rSegments: string[] = []
  for (const s of path.split(/[/.$]/g)) {
    if (s === '..') {
      rSegments.pop()
    } else {
      rSegments.push(s)
    }
  }
  return '/' + rSegments.filter(Boolean).join('/')
}

export function setValue (obj, path, val) {
  const keys = path.split('.')
  const key = keys.pop()
  for (const key of keys) {
    if (!(key in obj)) {
      obj[key] = {}
    }
    obj = obj[key]
  }
  obj[key] = val
}

export function getValue (obj: any, path: string) {
  for (const key of path.split('.')) {
    if (!(key in obj)) {
      return undefined
    }
    obj = obj[key]
  }
  return obj
}

export function getSchemaPath (schema: Schema, path) {
  for (const key of path.split('.')) {
    if (!schema.properties || !(key in schema.properties)) {
      return undefined
    }
    schema = schema.properties[key]
  }
  return schema
}
