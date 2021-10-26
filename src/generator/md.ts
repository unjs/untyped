import type { Schema } from '../types'
import { genFunctionType } from './dts'

export function generateMarkdown (schema: Schema) {
  return _generateMarkdown(schema, '', '').join('\n')
}

export function _generateMarkdown (schema: Schema, title: string, level: string) {
  const lines: string[] = []

  lines.push(`${level} ${title}`)

  if (schema.type === 'object') {
    for (const key in schema.properties) {
      const val = schema.properties[key] as Schema
      lines.push('', ..._generateMarkdown(val, `\`${key}\``, level + '#'))
    }
    return lines
  }

  // Type and default
  lines.push(`- **Type**: \`${schema.tsType || schema.type}\``)
  if ('default' in schema) {
    lines.push(`- **Default**: \`${JSON.stringify(schema.default)}\``)
  }
  lines.push('')

  // Title
  if (schema.title) {
    lines.push('> ' + schema.title, '')
  }

  // Signuture (function)
  if (schema.type === 'function') {
    lines.push('```ts', genFunctionType(schema), '```', '')
  }

  // Description
  if (schema.description) {
    lines.push('', schema.description, '')
  }

  return lines
}
