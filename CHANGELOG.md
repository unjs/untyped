# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.4.5](https://github.com/unjs/untyped/compare/v0.4.4...v0.4.5) (2022-08-04)

### [0.4.4](https://github.com/unjs/untyped/compare/v0.4.3...v0.4.4) (2022-03-31)


### Bug Fixes

* check for object type when recursing into a property ([#31](https://github.com/unjs/untyped/issues/31)) ([13bd920](https://github.com/unjs/untyped/commit/13bd920fcdba82f23914f2c43d0eb0d5c591e987))

### [0.4.3](https://github.com/unjs/untyped/compare/v0.4.2...v0.4.3) (2022-03-15)


### Bug Fixes

* **pkg:** add implicit dependencies ([c3f77bc](https://github.com/unjs/untyped/commit/c3f77bc6a5000c165b331052ba5db2aa84ed0460)), closes [#29](https://github.com/unjs/untyped/issues/29)

### [0.4.2](https://github.com/unjs/untyped/compare/v0.4.1...v0.4.2) (2022-03-09)


### Bug Fixes

* **dts:** default behavior for allowExtraKeys ([9ebe52c](https://github.com/unjs/untyped/commit/9ebe52c2c98b217aed5a3b79e94f19e223d343ba))

### [0.4.1](https://github.com/unjs/untyped/compare/v0.4.0...v0.4.1) (2022-03-09)


### Features

* **dts:** allowExtraKeys ([38eb888](https://github.com/unjs/untyped/commit/38eb8888044e1b8a1aff6e1da6a51fa76daece4b))

## [0.4.0](https://github.com/unjs/untyped/compare/v0.3.0...v0.4.0) (2022-03-09)


### ⚠ BREAKING CHANGES

* **dts:** move interfaceName to options object
* update transform subpath exports
* update repo and dependencies

### Features

* **dts:** allow disable default comments ([7862f3b](https://github.com/unjs/untyped/commit/7862f3b35b018e6b3d8d5c64ff23f9eb1988d7d9))
* **dts:** allow disable export generation ([f8d5f56](https://github.com/unjs/untyped/commit/f8d5f569cbeb4c53d1e95c184110358caac5a74b))
* **dts:** default description for values ([9e2e6b4](https://github.com/unjs/untyped/commit/9e2e6b4b785f2b368669fbcc524c92efee6f0b37))
* **dts:** initial indentation ([f4f40b9](https://github.com/unjs/untyped/commit/f4f40b911b3dab7f9b6a5133a388f92086cbc90c))


* **dts:** move interfaceName to options object ([a573e3b](https://github.com/unjs/untyped/commit/a573e3bae4fac27c2628b0108e6cbeba7d4245b0))
* update repo and dependencies ([614cdaa](https://github.com/unjs/untyped/commit/614cdaa852ebd114e13f2ce73f8790abe175ac2b))
* update transform subpath exports ([c9e0e56](https://github.com/unjs/untyped/commit/c9e0e5622749668bb5be00b3b9e06d9f619dddc5))

## [0.3.0](https://github.com/unjs/untyped/compare/v0.2.13...v0.3.0) (2021-11-18)


### ⚠ BREAKING CHANGES

* extract top-level type imports (#26)

### Features

* extract top-level type imports ([#26](https://github.com/unjs/untyped/issues/26)) ([33c76fc](https://github.com/unjs/untyped/commit/33c76fccf39f66ac880e6de37e7bf9f7b1296f52))


### Bug Fixes

* improve custom `tsType` handling ([#25](https://github.com/unjs/untyped/issues/25)) ([696214d](https://github.com/unjs/untyped/commit/696214d4512ecb905aa2ed592499d6f5dcbc7b7e))

### [0.2.13](https://github.com/unjs/untyped/compare/v0.2.12...v0.2.13) (2021-11-10)


### Bug Fixes

* allow for braces within type declarations ([#24](https://github.com/unjs/untyped/issues/24)) ([a750cae](https://github.com/unjs/untyped/commit/a750caedbf207764192e4c090efed72a633ea677))

### [0.2.12](https://github.com/unjs/untyped/compare/v0.2.11...v0.2.12) (2021-11-05)


### Features

* `tsType`, `type` and `markdownType` [#22](https://github.com/unjs/untyped/issues/22)) ([10f989b](https://github.com/unjs/untyped/commit/10f989b0caeaa51b5d6cab2deb53cbdca95bac40))

### [0.2.11](https://github.com/unjs/untyped/compare/v0.2.10...v0.2.11) (2021-11-02)


### Bug Fixes

* clone array defaults ([#21](https://github.com/unjs/untyped/issues/21)) ([4d8016d](https://github.com/unjs/untyped/commit/4d8016d256308a392c2c602bc1d285d378676989))

### [0.2.10](https://github.com/unjs/untyped/compare/v0.2.9...v0.2.10) (2021-10-26)


### Features

* add support for `[@type](https://github.com/type)`, `[@param](https://github.com/param)` and `[@returns](https://github.com/returns)` typings ([#20](https://github.com/unjs/untyped/issues/20)) ([c5d5453](https://github.com/unjs/untyped/commit/c5d545317a2f49a3584ffc30650f767a763e0d15))

### [0.2.9](https://github.com/unjs/untyped/compare/v0.2.8...v0.2.9) (2021-09-21)


### Bug Fixes

* **pkg:** use `.cjs` transform exports ([238b429](https://github.com/unjs/untyped/commit/238b4292a8e87e3c69bd7f2d8a1c033e1d7be827))

### [0.2.8](https://github.com/unjs/untyped/compare/v0.2.7...v0.2.8) (2021-07-29)


### Bug Fixes

* cache babel loader based on untyped version ([#14](https://github.com/unjs/untyped/issues/14)) ([bc6f679](https://github.com/unjs/untyped/commit/bc6f67938adc1475203f3f0feb0763d1966c0c1b))
* preserve spacing at beginnings of lines ([#16](https://github.com/unjs/untyped/issues/16)) ([f8c07e7](https://github.com/unjs/untyped/commit/f8c07e75c99dae08a6565cf092bfce669632d8e0))

### [0.2.7](https://github.com/unjs/untyped/compare/v0.2.6...v0.2.7) (2021-07-22)


### Bug Fixes

* don't split codeblocks with blank lines ([#13](https://github.com/unjs/untyped/issues/13)) ([85feb2f](https://github.com/unjs/untyped/commit/85feb2f26259aa74e7e09314a5cd28315c712e97))

### [0.2.6](https://github.com/unjs/untyped/compare/v0.2.5...v0.2.6) (2021-07-22)


### Bug Fixes

* handle multiline tags, title, description ([#12](https://github.com/unjs/untyped/issues/12)) ([45b2f7d](https://github.com/unjs/untyped/commit/45b2f7d9d68fa954aefa36343a49ef5b9b186371))

### [0.2.5](https://github.com/unjs/untyped/compare/v0.2.4...v0.2.5) (2021-04-09)


### Features

* only handle functions with [@untyped](https://github.com/untyped) tag ([a01f5a2](https://github.com/unjs/untyped/commit/a01f5a2fd2a04c7286ccdc5047581266cf21c587))


### Bug Fixes

* properly inject `$schema` property ([ded914e](https://github.com/unjs/untyped/commit/ded914ef52ec7ee0e41c8d8faaf3b23fb3f389e9))

### [0.2.4](https://github.com/unjs/untyped/compare/v0.2.3...v0.2.4) (2021-04-02)


### Bug Fixes

* resolve default for empty objects ([0257222](https://github.com/unjs/untyped/commit/025722260e20abf342f0c58ef263206bb2c03972))

### [0.2.3](https://github.com/unjs/untyped/compare/v0.2.2...v0.2.3) (2021-04-02)


### Bug Fixes

* handle empty object type ([98e6172](https://github.com/unjs/untyped/commit/98e617262cf4dac19ebe8f3a588dd02b3b268e97))

### [0.2.2](https://github.com/unjs/untyped/compare/v0.2.1...v0.2.2) (2021-03-28)


### Features

* improve function typing ([#2](https://github.com/unjs/untyped/issues/2)) ([76cb654](https://github.com/unjs/untyped/commit/76cb65406c688ff784004c9ba908ebc647f8fac4))


### Bug Fixes

* fix generated signuture ([786a6cf](https://github.com/unjs/untyped/commit/786a6cfdff5c9493702be4fe053f4ef0070be003))
* generate id with / for jsonschema compatibility ([a4cdfd2](https://github.com/unjs/untyped/commit/a4cdfd2e299ac4b0755b61b1987b764d7de10168))
* types improvements ([#3](https://github.com/unjs/untyped/issues/3)) ([0738d9b](https://github.com/unjs/untyped/commit/0738d9b15dde86ab572850d13feb999191df21bc))

### [0.2.1](https://github.com/unjs/untyped/compare/v0.0.5...v0.2.1) (2021-03-25)


### Features

* apply cirtular defaults ([f847195](https://github.com/unjs/untyped/commit/f8471958b5b8489c8ffcd3adc7e817b2d16b9a9b))
* basic markdown generation ([d2c25b7](https://github.com/unjs/untyped/commit/d2c25b7478daafe6f1ab73f650f3953afa0be69d))
* infer function types ([#1](https://github.com/unjs/untyped/issues/1)) ([8f16a32](https://github.com/unjs/untyped/commit/8f16a326ff69b7799a7224decbd63e7a98b26c45))

### [0.0.5](https://github.com/unjs/untyped/compare/v0.0.4...v0.0.5) (2021-03-23)


### Features

* applyDefaults and updated playground ([1e6550f](https://github.com/unjs/untyped/commit/1e6550fbabceffa333642f9270b0999b477f9948))


### Bug Fixes

* preserve additional tags in generated types ([7c01b35](https://github.com/unjs/untyped/commit/7c01b35855aa43838e0b10a1d0515390df69d3a1))

### [0.0.4](https://github.com/unjs/untyped/compare/v0.0.3...v0.0.4) (2021-03-23)


### Features

* support loader with jsdoc support ([b31b4af](https://github.com/unjs/untyped/commit/b31b4af0ce954b5ddfae267b3fdc4aa84feff51a))


### Bug Fixes

* handle empty types ([d82bf01](https://github.com/unjs/untyped/commit/d82bf01977561888b8275f596b14ace882a9abda))
* return plain values if no nested schema ([f9f2c04](https://github.com/unjs/untyped/commit/f9f2c04026fe4040a0cdd6bb38dc9646f5634bbd))

### [0.0.3](https://github.com/unjs/untyped/compare/v0.0.2...v0.0.3) (2021-03-21)


### Features

* resolve dependencies without order ([f04e49f](https://github.com/unjs/untyped/commit/f04e49f788af3c9d46dfabe78ac4e27c2408df4d))


### Bug Fixes

* **dts:** include falsy defaults ([132f30d](https://github.com/unjs/untyped/commit/132f30d0698f801c1d4389373f4302c516e7da8d))
* improve array handling ([f1a62f3](https://github.com/unjs/untyped/commit/f1a62f38ad634aa212c03ac075ba0a65044703a2))

### [0.0.2](https://github.com/unjs/untyped/compare/v0.0.1...v0.0.2) (2021-03-20)


### Bug Fixes

* use mapType for dts ([042fae7](https://github.com/unjs/untyped/commit/042fae75a702c0e412f8975b359d7110cdfaad2e))

### 0.0.1 (2021-03-20)


### Features

* initial commit ([a074493](https://github.com/unjs/untyped/commit/a074493fbe1e1e62a3a36b04fcb090455dd19ce2))
