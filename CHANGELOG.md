# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
