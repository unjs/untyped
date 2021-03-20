import { writeFile, mkdir } from 'fs/promises'
import { resolve, dirname } from 'path'

async function writeFileContents (path:string, contents: string) {
  await mkdir(dirname(path)).catch(() => { })
  await writeFile(path, contents, 'utf-8')
}

export function expectSnapshot (obj: any, fileName: string) {
  const serialized = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2)
  writeFileContents(resolve(__dirname, '.tmp', fileName), serialized)
    .catch(console.error) // eslint-disable-line no-console
  expect(serialized).toMatchSnapshot()
}
