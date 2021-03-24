import type { PluginObj } from '@babel/core'
import * as t from '@babel/types'
import { Schema } from '../types'

export default function babelPluginUntyped() {
  return <PluginObj>{
    visitor: {
      ObjectProperty (p) {
        if (p.node.leadingComments) {
          const { comments, tags } = parseJSDocs(
            p.node.leadingComments
              .filter(c => c.type === 'CommentBlock')
              .map(c => c.value)
          )

          const schema: Partial<Schema> = {}
          if (comments.length) {
            schema.title = comments.shift()
          }
          if (comments.length) {
            schema.description = comments.join('\n')
          }

          // Infer function arguments
          const code = this.file.code.split('\n')
          const getCode = (loc) => code[loc.start.line - 1].slice(loc.start.column, loc.end.column).trim() || ''
          if (p.node.value.type === 'ArrowFunctionExpression') {
            p.node.value.params.forEach((param, index) => {
              if (param.loc.end.line !== param.loc.start.line) { return null }
              const isAssignment = param.type === 'AssignmentPattern'
              const _param = isAssignment ? param.left : param
              const _paramDocs = {
                name: _param.name || ('arg' + index),
                type: getCode(_param.loc)
                  .split(':').slice(1).join(':').trim()
              }

              let defaultValue = null
              if (isAssignment) {
                defaultValue = getCode(param.right.loc)
              }

              if (!tags.find(t => t[0] === 'param' && t[1].includes(_paramDocs.name))) {
                // TODO merge type
                tags.push(
                  `@param {${_paramDocs.type}} ${defaultValue ? `[${_paramDocs.name}=${defaultValue}]` : _paramDocs.name}`
                )
              }
            })
            if (!schema.description) {
              schema.description = getCode(p.node.value.loc)
            }
          }

          const schemaAstProps =
            Object.entries(schema).map(e => t.objectProperty(t.identifier(e[0]), t.stringLiteral(e[1] as string)))

          schemaAstProps.push(
            t.objectProperty(
              t.identifier('tags'),
              t.arrayExpression(tags.map(tag => t.stringLiteral(tag)))
            ))

          const schemaAst = t.objectExpression(schemaAstProps)

          if (p.node.value.type === 'ObjectExpression') {
            const schemaProp = p.node.value.properties.find(prop =>
              ('key' in prop) && prop.key.type === 'Identifier' && prop.key.name === '$schema'
            )
            if (schemaProp && 'value' in schemaProp) {
              if (schemaProp.value.type === 'ObjectExpression') {
                // Object has $schema
                schemaProp.value.properties.push(...schemaAstProps)
              } else {
                // Object has $schema which is not an object
                // SKIP
              }
            } else {
              // Object has not $schema
              p.node.value.properties.unshift(t.objectProperty(t.identifier('$schema'), schemaAst))
            }
          } else {
            // Literal value
            p.node.value = t.objectExpression([
              t.objectProperty(t.identifier('$default'), p.node.value),
              t.objectProperty(t.identifier('$schema'), schemaAst)
            ])
          }
          p.node.leadingComments = []
        }
      }
    }
  }
}

function parseJSDocs (input: string | string[]) {
  const lines = [].concat(input)
    .map(c => c.split('\n').map(l => l.replace(/^[\s*]+|[\s*]$/, '')))
    .flat()
    .filter(Boolean)

  const comments: string[] = []

  while (lines.length && !lines[0].startsWith('@')) {
    comments.push(lines.shift())
  }

  const tags: string[] = []
  for (const line of lines) {
    tags.push(line)
  }

  return {
    comments,
    tags
  }
}
