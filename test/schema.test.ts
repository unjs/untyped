// import { posix as p } from 'path'
import { resolveSchema, generateDts } from '../src'
import type { InputObject } from '../src/types'
import { expectSnapshot } from './utils'

const fixture1: InputObject = {
  name: 'earth',
  specs: {
    gravity: {
      $resolve: val => parseFloat(val),
      $default: '9.8'
    },
    moons: {
      $resolve: (val = ['moon']) => [].concat(val),
      $schema: {
        title: 'planet moons'
      }
    }
  }
}

// const fixture2: InputObject = {
//   srcDir: 'src',
//   userOptions: {
//     $schema: {
//       title: 'custom user options'
//     }
//   },
//   workingDir: {
//     $default: '/',
//     $schema: {
//       title: 'working directory'
//     }
//   },
//   entry: {
//     $resolve: (val: string = 'index.js', parent: any) => p.resolve(parent.workingDir, parent.srcDir, val),
//     $schema: {
//       title: 'entrty file',
//       description: 'will be resolved from current working directory if not absolute'
//     }
//   }
// }

describe('schema', () => {
  it('resolveSchema', () => {
    const schema = resolveSchema(fixture1)
    expectSnapshot(schema, 'schema.json')
  })
})

describe('dts', () => {
  it('generateDts', () => {
    const schema = resolveSchema(fixture1)
    const dts = generateDts(schema)
    expectSnapshot(dts, 'fixture.gen.d.ts')
  })
})
