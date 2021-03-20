# magic-schema

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]
[![bundle][bundle-src]][bundle-href]



**▶️ Check [online playground](https://magic-schema.unjs.io)**


## Usage

### Install package

Install `magic-schema` npm package:

```sh
yarn add magic-schema
# or
npm i magic-schema
```

### Define reference object

First we have to define a reference object that describes types, defaults and normalizer

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

### Resolving Schema

```js
import { resolveSchema } from 'magic-schema'

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

### Generating types


```js
import { resolveSchema } from 'magic-schema'

const types = generateDts(resolveSchema(defaultPlanet))
```

Output:

```ts
interface MyObject {
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

## Contribution

- Clone repository
- Install dependencies with `yarn install`
- Use `yarn dev` to start jest watcher verifying changes
- Use `yarn test` before push to ensure all tests and lint checks passing

## License

[MIT](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/magic-schema?style=flat-square
[npm-version-href]: https://npmjs.com/package/magic-schema

[npm-downloads-src]: https://img.shields.io/npm/dm/magic-schema?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/magic-schema

[github-actions-src]: https://img.shields.io/github/workflow/status/unjs/magic-schema/ci/main?style=flat-square
[github-actions-href]: https://github.com/unjs/magic-schema/actions?query=workflow%3Aci

[codecov-src]: https://img.shields.io/codecov/c/gh/unjs/magic-schema/main?style=flat-square
[codecov-href]: https://codecov.io/gh/unjs/magic-schema

[bundle-src]: https://img.shields.io/bundlephobia/minzip/magic-schema?style=flat-square
[bundle-href]: https://bundlephobia.com/result?p=magic-schema
