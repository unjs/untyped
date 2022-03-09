import type { Schema, JSType, TypeDescriptor } from '../types'
import { escapeKey, normalizeTypes } from '../utils'

export interface GenerateTypesOptions {
 addExport?: boolean
 addDefaults?: boolean
 defaultDescrption?: string
}

const GenerateTypesDefaults: GenerateTypesOptions = {
  addExport: true,
  addDefaults: true
}

const TYPE_MAP: Record<JSType, string> = {
  array: 'any[]',
  bigint: 'bigint',
  boolean: 'boolean',
  number: 'number',
  object: 'any',
  any: 'any',
  string: 'string',
  symbol: 'Symbol',
  function: 'Function'
}

const SCHEMA_KEYS = [
  'items',
  'default',
  'resolve',
  'properties',
  'title',
  'description',
  '$schema',
  'type',
  'tsType',
  'markdownType',
  'tags',
  'args',
  'id',
  'returns'
]

const DECLARATION_RE = /typeof import\(['"](?<source>[^)]+)['"]\)(\.(?<type>\w+)|\[['"](?<type1>\w+)['"]\])/g

function extractTypeImports (declarations: string) {
  const typeImports: Record<string, Set<string>> = {}
  const aliases = new Set<string>()
  const imports = []
  for (const match of declarations.matchAll(DECLARATION_RE)) {
    const { source, type1, type = type1 } = match.groups || {}
    typeImports[source] = typeImports[source] || new Set()
    typeImports[source].add(type)
  }
  for (const source in typeImports) {
    const sourceImports = []
    for (const type of typeImports[source]) {
      let count = 0
      let alias = type
      while (aliases.has(alias)) {
        alias = `${type}${count++}`
      }
      aliases.add(alias)
      sourceImports.push(alias === type ? type : `${type} as ${alias}`)
      declarations = declarations.replace(new RegExp(`typeof import\\(['"]${source}['"]\\)(\\.${type}|\\[['"]${type}['"]\\])`, 'g'), alias)
    }
    imports.push(`import type { ${sourceImports.join(', ')} } from '${source}'`)
  }
  return [...imports, declarations].join('\n')
}

export function generateTypes (schema: Schema, name: string = 'Untyped', opts?: GenerateTypesOptions) {
  opts = { ...GenerateTypesDefaults, ...opts }
  const interfaceCode = `interface ${name} {\n  ` + _genTypes(schema, ' ', opts).join('\n ') + '\n}'
  return extractTypeImports(opts.addExport ? `export ${interfaceCode}` : interfaceCode)
}

function _genTypes (schema: Schema, spaces: string, opts: GenerateTypesOptions): string[] {
  const buff: string[] = []

  for (const key in schema.properties) {
    const val = schema.properties[key] as Schema
    buff.push(...generateJSDoc(val, opts))
    if (val.tsType) {
      buff.push(`${escapeKey(key)}: ${val.tsType},\n`)
    } else if (val.type === 'object') {
      buff.push(`${escapeKey(key)}: {`, ..._genTypes(val, spaces + ' ', opts), '},\n')
    } else {
      let type: string
      if (val.type === 'array') {
        type = `Array<${getTsType(val.items)}>`
      } else if (val.type === 'function') {
        type = genFunctionType(val)
      } else {
        type = getTsType(val)
      }
      buff.push(`${escapeKey(key)}: ${type},\n`)
    }
  }

  if (buff.length) {
    const last = buff.pop() || ''
    buff.push(last.substr(0, last.length - 1))
  } else {
    buff.push('[key: string]: any')
  }

  return buff.map(i => spaces + i)
}

function getTsType (type: TypeDescriptor | TypeDescriptor[]): string {
  if (Array.isArray(type)) {
    return [].concat(normalizeTypes(type.map(t => getTsType(t)))).join('|') || 'any'
  }
  if (!type) {
    return 'any'
  }
  if (type.tsType) {
    return type.tsType
  }
  if (!type.type) {
    return 'any'
  }
  if (Array.isArray(type.type)) {
    return type.type.map(t => TYPE_MAP[t]).join('|')
  }
  if (type.type === 'array') {
    return `Array<${getTsType(type.items)}>`
  }
  return TYPE_MAP[type.type] || type.type
}

export function genFunctionType (schema) {
  return `(${genFunctionArgs(schema.args)}) => ${getTsType(schema.returns)}`
}

export function genFunctionArgs (args: Schema['args']) {
  return args?.map((arg) => {
    let argStr = arg.name
    if (arg.optional || arg.default) {
      argStr += '?'
    }
    if (arg.type || arg.tsType) {
      argStr += `: ${getTsType(arg)}`
    }
    return argStr
  }).join(', ') || ''
}

function generateJSDoc (schema: Schema, opts: GenerateTypesOptions): string[] {
  let buff = []

  if (schema.title) {
    buff.push(schema.title)
  }

  if (schema.description) {
    buff.push(schema.description)
  } else if (opts.defaultDescrption && schema.type !== 'object') {
    buff.push(opts.defaultDescrption)
  }

  if (
    opts.addDefaults &&
    schema.type !== 'object' && schema.type !== 'any' &&
    !(Array.isArray(schema.default) && schema.default.length === 0)
  ) {
    const stringified = JSON.stringify(schema.default)
    if (stringified) {
      buff.push(`@default ${stringified.replace(/\*\//g, '*\\/')}`)
    }
  }

  for (const key in schema) {
    if (!SCHEMA_KEYS.includes(key)) {
      buff.push('', `@${key} ${schema[key]}`)
    }
  }

  if (Array.isArray(schema.tags)) {
    for (const tag of schema.tags) {
      if (tag !== '@untyped') {
        buff.push('', tag)
      }
    }
  }

  // Normalize new lines in values
  buff = buff.map(i => i.split('\n')).flat()

  if (buff.length) {
    return buff.length === 1
      ? ['/** ' + buff[0] + ' */']
      : ['/**', ...buff.map(i => ` * ${i}`), '*/']
  }

  return []
}
