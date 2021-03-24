import type { PluginObj } from '@babel/core'
import * as t from '@babel/types'
import { Schema } from '../types'

export default function babelPluginUntyped () {
  return <PluginObj>{
    visitor: {
      ObjectProperty (p) {
        if (p.node.leadingComments) {
          const { comments, blockTags } = parseJSDocs(
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
          for (const tag in blockTags) {
            schema[tag] = blockTags[tag]
          }

          const schemaAstProps =
            Object.entries(schema).map(e => t.objectProperty(t.identifier(e[0]), t.stringLiteral(e[1] as string)))
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

  const blockTags: Record<string, string> = {}
  let lastTag = null
  for (const line of lines) {
    const m = line.match(/@(\w+) ?(.*)/)
    if (m) {
      blockTags[m[1]] = m[2]
      lastTag = m[1]
    } else {
      blockTags[lastTag] =
        (blockTags[lastTag] ? blockTags[lastTag] + '\n' : '') + line
    }
  }

  return {
    comments,
    blockTags
  }
}
