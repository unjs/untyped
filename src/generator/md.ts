import type { Schema } from '../types'

export function generateMarkdown (schema: Schema) {
  return _generateMarkdown(schema, '', '').join('\n')
}

export function _generateMarkdown (schema: Schema, title: string, level) {
  const lines: string[] = []

  lines.push(`${level} ${title}`)

  if (schema.type === 'object') {
    for (const key in schema.properties) {
      const val = schema.properties[key] as Schema
      lines.push(..._generateMarkdown(val, `\`${key}\``, level + '#'))
    }
    return lines
  }

  lines.push(`**Type**: \`${schema.type}\`    `)
  if ('default' in schema) {
    lines.push(`**Default**: \`${JSON.stringify(schema.default)}\`    `)
  }
  if (schema.title) {
    lines.push('', schema.title, '')
  }
  if (schema.description) {
    lines.push('', schema.description, '')
  }

  return lines
}
