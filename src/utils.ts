import type { JSType } from './types'

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

export function isObject (val: any): boolean {
  return val !== null && !Array.isArray(val) && typeof val === 'object'
}

export function unique (arr: any[]) {
  return Array.from(new Set(arr))
}
