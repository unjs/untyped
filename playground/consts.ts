export const defaultReference = `
/**
 * create a new nuxt instance
 *
 * @param config - Your Nuxt config
 */
 export default {
    /**
      * Foo
      */
     a: (config: NuxtConfig = {}): Nuxt => {
         return 42 + 32
     },
     b: (config: NuxtConfig): Nuxt => {},
     c: ({ config }: NuxtConfig): Nuxt => {},
     d: ({ config }: NuxtConfig = {}): Nuxt => {},
 }
`.trim()

export const defaultInput = `
export const config = {
    name: 'foo',
    dimensions: {
        height: 25
    },
    tags: ['custom']
}
`.trim()
