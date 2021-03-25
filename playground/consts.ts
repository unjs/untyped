export const defaultReference = `
export function add (id: String, date = new Date(), append?: Boolean) {}

export const config = {
    name: 'default',
    price: 12.5,
    /**
     * checked state
     */
    checked: false,
    dimensions: {
        /** width in px */
        width: 10,
        /** height in px */
        height: 10
    },
    tags: {
        $resolve: (val) => ['tag1'].concat(val).filter(Boolean)
    }
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
