import type { PluginObj } from '@babel/core'
import * as t from '@babel/types'
import { Schema, JSType, TypeDescriptor, FunctionArg } from '../types'
import { normalizeTypes, mergedTypes, cachedFn } from '../utils'

type GetCodeFn = (loc: t.SourceLocation) => string

export default function babelPluginUntyped () {
  return <PluginObj>{
    visitor: {
      VariableDeclaration (p) {
        const declaration = p.node.declarations[0]
        if (declaration.id.type === 'Identifier' && declaration.init.type === 'FunctionExpression') {
          const newDeclaration = t.functionDeclaration(declaration.id, declaration.init.params, declaration.init.body)
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
              p.node.value.properties.unshift(astify({ $schema: schema }))
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
        // TODO: find associated jsdoc
        const schema = parseJSDocs(
          (p.node.leadingComments || [])
            .filter(c => c.type === 'CommentBlock')
            .map(c => c.value)
        )
        schema.type = 'function'
        schema.args = []

        const _getLines = cachedFn(() => this.file.code.split('\n'))
        const getCode: GetCodeFn = loc => _getLines()[loc.start.line - 1].slice(loc.start.column, loc.end.column).trim() || ''

        // Extract arguments
        p.node.params.forEach((param, index) => {
          if (param.loc.end.line !== param.loc.start.line) {
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
            // if (param.right.type === 'TSAsExpression') {
            //   arg.default = getCode(param.right.expression.loc)
            // } else {
            //   arg.default = getCode(param.right.loc)
            // }
            // if (param.right.type === 'TSAsExpression' && param.right.typeAnnotation.type === 'TSTypeReference' && param.right.typeAnnotation.typeName.type === 'Identifier' && param.right.typeAnnotation.typeName.name === 'const') {
            //   // Ignore 'as const' as it's not properly a type on its own
            //   switch (param.right.expression.type) {
            //     case 'BigIntLiteral':
            //     case 'BooleanLiteral':
            //     case 'DecimalLiteral':
            //     case 'NullLiteral':
            //     case 'NumericLiteral':
            //     case 'RegExpLiteral':
            //     case 'StringLiteral':
            //       arg.type = arg.type || getCode(param.right.expression.loc)
            //       break

            //     default:
            //       arg.type = arg.type || getType(param.right.expression, getCode)
            //   }
            // } else {
            //   arg.type = arg.type || getType(param.right, getCode)
            // }
          }
          schema.args.push(arg)
        })

        // Return type annotation
        if (p.node.returnType?.type === 'TSTypeAnnotation') {
          schema.returns = inferAnnotationType(p.node.returnType, getCode)
        }

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

function parseJSDocs (input: string | string[]): Schema {
  const schema: Schema = {}

  const lines = [].concat(input)
    .map(c => c.split('\n').map(l => l.replace(/^[\s*]+|[\s*]$/, '')))
    .flat()
    .filter(Boolean)

  const comments: string[] = []
  while (lines.length && !lines[0].startsWith('@')) {
    comments.push(lines.shift())
  }
  if (comments.length === 1) {
    schema.title = comments[0]
  } else if (comments.length > 1) {
    schema.title = comments[0]
    schema.description = comments.splice(1).join('\n')
  }

  if (lines.length) {
    schema.tags = []
    for (const line of lines) {
      schema.tags.push(line)
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

const AST_JSTYPE_MAP: Partial<Record<t.Expression['type'], JSType>> = {
  StringLiteral: 'string',
  BooleanLiteral: 'boolean',
  BigIntLiteral: 'bigint',
  DecimalLiteral: 'number',
  NumericLiteral: 'number',
  ObjectExpression: 'object',
  FunctionExpression: 'function',
  ArrowFunctionExpression: 'function'
  // RegExpLiteral: 'RegExp
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
  if (e.type === 'TypeCastExpression' || e.type === 'TSAsExpression') {
    return {
      type: getCode(e.typeAnnotation.loc) as JSType
    }
  }
  if (e.type === 'NewExpression' && e.callee.type === 'Identifier') {
    return {
      type: e.callee.name as JSType
    }
  }
  if (e.type === 'ArrayExpression' || e.type === 'TupleExpression') {
    const itemTypes = e.elements
      .filter(el => t.isExpression(el))
      .flatMap(el => inferArgType(el as any, getCode).type)
    return {
      type: 'array',
      items: { type: normalizeTypes(itemTypes) }
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
      type: getCode(tsType.loc) as JSType
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
    type: getCode(tsType.loc) as JSType
  }
  // }
  // return null
}
