import type { ConfigAPI, PluginItem, PluginObj } from '@babel/core'
import * as t from '@babel/types'
import { Schema, JSType, TypeDescriptor, FunctionArg } from '../types'
import { normalizeTypes, mergedTypes, cachedFn } from '../utils'

import { version } from '../../package.json'

type GetCodeFn = (loc: t.SourceLocation) => string

export default <PluginItem> function babelPluginUntyped (api: ConfigAPI) {
  api.cache.using(() => version)

  return <PluginObj>{
    visitor: {
      VariableDeclaration (p) {
        const declaration = p.node.declarations[0]
        if (
          t.isIdentifier(declaration.id) &&
          (t.isFunctionExpression(declaration.init) || t.isArrowFunctionExpression(declaration.init))
        ) {
          const newDeclaration = t.functionDeclaration(declaration.id, declaration.init.params, declaration.init.body as t.BlockStatement)
          newDeclaration.returnType = declaration.init.returnType
          p.replaceWith(newDeclaration)
        }
      },
      ObjectProperty (p) {
        if (p.node.leadingComments) {
          const schema = parseJSDocs(
            p.node.leadingComments
              .filter(c => c.type === 'CommentBlock')
              .map(c => c.value)
          )

          if (p.node.value.type === 'ObjectExpression') {
            const schemaProp = p.node.value.properties.find(prop =>
              ('key' in prop) && prop.key.type === 'Identifier' && prop.key.name === '$schema'
            )
            if (schemaProp && 'value' in schemaProp) {
              if (schemaProp.value.type === 'ObjectExpression') {
                // Object has $schema
                schemaProp.value.properties.push(...astify(schema).properties)
              } else {
                // Object has $schema which is not an object
                // SKIP
              }
            } else {
              // Object has not $schema
              p.node.value.properties.unshift(...astify({ $schema: schema }).properties)
            }
          } else {
            // Literal value
            p.node.value = t.objectExpression([
              t.objectProperty(t.identifier('$default'), p.node.value),
              t.objectProperty(t.identifier('$schema'), astify(schema))
            ])
          }
          p.node.leadingComments = []
        }
      },
      FunctionDeclaration (p) {
        const schema = parseJSDocs(
          (p.parent.leadingComments || [])
            .filter(c => c.type === 'CommentBlock')
            .map(c => c.value)
        )
        schema.type = 'function'
        schema.args = []

        if (!schema.tags.includes('@untyped')) {
          return
        }

        const _getLines = cachedFn(() => this.file.code.split('\n'))
        const getCode: GetCodeFn = loc => _getLines()[loc.start.line - 1].slice(loc.start.column, loc.end.column).trim() || ''

        // Extract arguments
        p.node.params.forEach((param, index) => {
          if (param.loc?.end.line !== param.loc?.start.line) {
            return null
          }
          if (!t.isAssignmentPattern(param) && !t.isIdentifier(param)) {
            return null
          }
          const lparam = (t.isAssignmentPattern(param) ? param.left : param) as t.Identifier
          if (!t.isIdentifier(lparam)) {
            return null
          }
          const arg: FunctionArg = {
            name: lparam.name || ('arg' + index),
            optional: lparam.optional || undefined
          }

          // Infer from type annotations
          if (lparam.typeAnnotation) {
            Object.assign(arg, mergedTypes(arg, inferAnnotationType(lparam.typeAnnotation, getCode)))
          }

          // Infer type from default value
          if (param.type === 'AssignmentPattern') {
            Object.assign(arg, mergedTypes(arg, inferArgType(param.right, getCode)))
          }
          schema.args = schema.args || []
          schema.args.push(arg)
        })

        // Return type annotation
        if (p.node.returnType?.type === 'TSTypeAnnotation') {
          schema.returns = inferAnnotationType(p.node.returnType, getCode)
        }

        // Extract and apply any manual types
        schema.tags = schema.tags?.filter((tag) => {
          if (tag.startsWith('@returns')) {
            const { type } = tag.match(/^@returns\s+\{(?<type>[^}]+)\}/)?.groups || {}
            if (type) {
              schema.returns = schema.returns || {}
              schema.returns.type = type
              return false
            }
          }
          if (tag.startsWith('@param')) {
            const { type, param } = tag.match(/^@param\s+\{(?<type>[^}]+)\}\s+(?<param>\w+)/)?.groups || {}
            if (type && param) {
              const arg = schema.args?.find(arg => arg.name === param)
              if (arg) {
                arg.type = type
                return false
              }
            }
          }
          return true
        })

        // Replace function with it's meta
        p.replaceWith(t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier(p.node.id.name), astify({ $schema: schema })
          )
        ]))
      }
    }
  }
}

function containsIncompleteCodeblock (line = '') {
  const codeDelimiters = line.split('\n').filter(line => line.startsWith('```')).length
  return !!(codeDelimiters % 2)
}

function clumpLines (lines: string[], delimiters = [' '], separator = ' ') {
  const clumps: string[] = []
  while (lines.length) {
    const line = lines.shift()
    if (
      (line && !delimiters.includes(line[0]) && clumps[clumps.length - 1]) ||
      containsIncompleteCodeblock(clumps[clumps.length - 1])
    ) {
      clumps[clumps.length - 1] += separator + line
    } else {
      clumps.push(line)
    }
  }
  return clumps.filter(Boolean)
}

function parseJSDocs (input: string | string[]): Schema {
  const schema: Schema = {
    title: '',
    description: '',
    tags: []
  }

  const lines = ([] as string[]).concat(input)
    .map(c => c.split('\n').map(l => l.replace(/(^\s*[*]+ )|([\s*]+$)/g, '')))
    .flat()

  const firstTag = lines.findIndex(l => l.startsWith('@'))
  const comments = clumpLines(lines.slice(0, firstTag >= 0 ? firstTag : undefined))

  if (comments.length === 1) {
    schema.title = comments[0]
  } else if (comments.length > 1) {
    schema.title = comments[0]
    schema.description = comments.splice(1).join('\n')
  }

  if (firstTag >= 0) {
    const tags = clumpLines(lines.slice(firstTag), ['@'], '\n')
    for (const tag of tags) {
      if (tag.startsWith('@type')) {
        schema.type = tag.match(/@type\s+\{([^}]+)\}/)?.[1]
        continue
      }
      schema.tags.push(tag.trim())
    }
  }

  return schema
}

function astify (val: any) {
  if (typeof val === 'string') {
    return t.stringLiteral(val)
  }
  if (typeof val === 'boolean') {
    return t.booleanLiteral(val)
  }
  if (typeof val === 'number') {
    return t.numericLiteral(val)
  }
  if (val === null) {
    return t.nullLiteral()
  }
  if (val === undefined) {
    return t.identifier('undefined')
  }
  if (Array.isArray(val)) {
    return t.arrayExpression(val.map(item => astify(item)))
  }
  return t.objectExpression(Object.getOwnPropertyNames(val)
    .filter(key => val[key] !== undefined && val[key] !== null)
    .map(key => t.objectProperty(t.identifier(key), astify(val[key])))
  )
}

const AST_JSTYPE_MAP: Partial<Record<t.Expression['type'], JSType | 'RegExp'>> = {
  StringLiteral: 'string',
  BooleanLiteral: 'boolean',
  BigIntLiteral: 'bigint',
  DecimalLiteral: 'number',
  NumericLiteral: 'number',
  ObjectExpression: 'object',
  FunctionExpression: 'function',
  ArrowFunctionExpression: 'function',
  RegExpLiteral: 'RegExp'
}

function inferArgType (e: t.Expression, getCode: GetCodeFn): TypeDescriptor {
  if (AST_JSTYPE_MAP[e.type]) {
    return {
      type: AST_JSTYPE_MAP[e.type]
    }
  }
  if (e.type === 'AssignmentExpression') {
    return inferArgType(e.right, getCode)
  }
  if (e.type === 'NewExpression' && e.callee.type === 'Identifier') {
    return {
      type: e.callee.name
    }
  }
  if (e.type === 'ArrayExpression' || e.type === 'TupleExpression') {
    const itemTypes = e.elements
      .filter(el => t.isExpression(el))
      .flatMap(el => inferArgType(el as any, getCode).type)
    return {
      type: 'array',
      items: {
        type: normalizeTypes(itemTypes)
      }
    }
  }
  return {}
}

function inferAnnotationType (ann: t.Identifier['typeAnnotation'], getCode: GetCodeFn): TypeDescriptor | null {
  if (ann.type !== 'TSTypeAnnotation') { return null }
  return inferTSType(ann.typeAnnotation, getCode)
}

function inferTSType (tsType: t.TSType, getCode: GetCodeFn): TypeDescriptor | null {
  if (tsType.type === 'TSParenthesizedType') {
    return inferTSType(tsType.typeAnnotation, getCode)
  }
  if (tsType.type === 'TSTypeReference') {
    if ('name' in tsType.typeName && tsType.typeName.name === 'Array') {
      return {
        type: 'array',
        items: inferTSType(tsType.typeParameters.params[0], getCode)
      }
    }
    return {
      type: getCode(tsType.loc)
    }
  }
  if (tsType.type === 'TSUnionType') {
    return mergedTypes(...tsType.types.map(t => inferTSType(t, getCode)))
  }
  if (tsType.type === 'TSArrayType') {
    return {
      type: 'array',
      items: inferTSType(tsType.elementType, getCode)
    }
  }
  // if (tsType.type.endsWith('Keyword')) {
  return {
    type: getCode(tsType.loc)
  }
  // }
  // return null
}
