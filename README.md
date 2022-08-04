# untyped

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]
[![bundle][bundle-src]][bundle-href]

**▶️ Check [online playground](https://untyped.unjs.io)**

## Install

```sh
# npm
npm i untyped

# yarn
yarn add untyped

# pnpm
pnpm add untyped
```

## Usage

First we have to define a reference object that describes types, defaults, and a `$resolve` method (normalizer).

```js
const defaultPlanet = {
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
```

## API

<a name="resolving-schema"></a>

### `resolveSchema`

```js
import { resolveSchema } from 'untyped'

const schema = resolveSchema(defaultPlanet)
```

Output:

```json
{
  "properties": {
    "name": {
      "type": "string",
      "default": "earth"
    },
    "specs": {
      "properties": {
        "gravity": {
          "default": 9.8,
          "type": "number"
        },
        "moons": {
          "title": "planet moons",
          "default": [
            "moon"
          ],
          "type": "array",
          "items": [
            {
              "type": "string"
            }
          ]
        }
      },
      "type": "object"
    }
  },
  "type": "object"
}
```
### `generateTypes`

```js
import { resolveSchema, generateTypes } from 'untyped'

const types = generateTypes(resolveSchema(defaultPlanet))
```

Output:

```ts
interface Untyped {
   /** @default "earth" */
  name: string,

  specs: {
    /** @default 9.8 */
    gravity: number,

    /**
     * planet moons
     * @default ["moon"]
    */
    moons: string[],
  },
}
```

### `generateMarkdown`

```js
import { resolveSchema, generateMarkdown } from 'untyped'

const markdown = generateMarkdown(resolveSchema(defaultPlanet))
```

Output:

```markdown
# `name`
- **Type**: `string`
- **Default**: `"earth"`


# `specs`

## `gravity`
- **Type**: `number`
- **Default**: `9.8`


## `moons`
- **Type**: `array`
- **Default**: `["moon"]`
```

## Contributing

- Clone repository
- Install dependencies with `yarn install`
- Use `yarn web` to start playground website
- Use `yarn test` before push to ensure all tests and lint checks passing

## License

[MIT](./LICENSE)

Thanks to [@dominikschreiber](https://github.com/dominikschreiber) for donating package name.

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/untyped?style=flat-square
[npm-version-href]: https://npmjs.com/package/untyped

[npm-downloads-src]: https://img.shields.io/npm/dm/untyped?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/untyped

[github-actions-src]: https://img.shields.io/github/workflow/status/unjs/untyped/ci/main?style=flat-square
[github-actions-href]: https://github.com/unjs/untyped/actions?query=workflow%3Aci

[codecov-src]: https://img.shields.io/codecov/c/gh/unjs/untyped/main?style=flat-square
[codecov-href]: https://codecov.io/gh/unjs/untyped

[bundle-src]: https://img.shields.io/bundlephobia/minzip/untyped?style=flat-square
[bundle-href]: https://bundlephobia.com/result?p=untyped
