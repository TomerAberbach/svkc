<h1 align="center">
  svkc
</h1>

<div align="center">
  <a href="https://npmjs.org/package/svkc">
    <img src="https://badgen.net/npm/v/svkc" alt="version" />
  </a>
  <a href="https://github.com/TomerAberbach/svkc/actions">
    <img src="https://github.com/TomerAberbach/svkc/workflows/CI/badge.svg" alt="CI" />
  </a>
  <a href="https://unpkg.com/svkc/dist/index.js">
    <img src="https://deno.bundlejs.com/?q=svkc&badge" alt="gzip size" />
  </a>
  <a href="https://unpkg.com/svkc/dist/index.js">
    <img src="https://deno.bundlejs.com/?q=svkc&config={%22compression%22:{%22type%22:%22brotli%22}}&badge" alt="brotli size" />
  </a>
  <a href="https://github.com/sponsors/TomerAberbach">
    <img src="https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86" alt="Sponsor" />
  </a>
</div>

<div align="center">
  JavaScript's keyed collections (Map & Set) with <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness">SameValue</a> semantics!
</div>

## Features

- **Familiar:** `SameValueMap` and `SameValueSet` extend JavaScript's built-in
  `Map` and `Set`
- **Compliant:** maintains all the invariants of `Map` and `Set` including
  method return values and even iteration order!
- **Tiny:** less than 350 bytes minzipped!

## Install

```sh
$ npm i svkc
```

## Huh?

A key in a `Map` or a value in a `Set` can only occur once. But how is the key
or value's uniqueness determined? JavaScript's `Map` and `Set` use the
[`sameValueZero` algorithm](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#same-value-zero_equality)
when checking if two keys or values are equal. The algorithm considers +0 and -0
to be equal, but they are actually two different values due to how
[IEEE floating point numbers](https://www.johndcook.com/blog/2010/06/15/why-computers-have-signed-zero)
work. This means that both `new Map([[0, 'zero'], [-0, 'negative zero']]).size`
and `new Set([0, -0]).size` return 1 rather than 2.

This package provides `SameValueMap` and `SameValueSet` that behave identically
to `Map` and `Set` except they consider +0 and -0 to be different values.

## Usage

Just use like a normal `Map` or `Set`!

```js
import { SameValueMap, SameValueSet } from 'svkc'

const sameValueMap = new SameValueMap()
sameValueMap.set(1, `one`)
sameValueMap.set(0, `zero`)
sameValueMap.set(-0, `negative zero`)
sameValueMap.set(-1, `negative one`)

console.log(sameValueMap.get(0))
//=> zero

console.log(sameValueMap.get(-0))
//=> negative zero

console.log([...sameValueMap])
//=> [ [ 1, 'one' ], [ 0, 'zero' ], [ -0, 'negative zero' ], [ -1, 'negative one' ] ]

sameValueMap.delete(0)

console.log(sameValueMap.has(0))
//=> false

console.log(sameValueMap.has(-0))
//=> true

const sameValueSet = new SameValueSet()
sameValueSet.add(1)
sameValueSet.add(0)
sameValueSet.add(-0)
sameValueSet.add(-1)

console.log(sameValueSet.has(0))
//=> true

console.log(sameValueSet.has(-0))
//=> true

console.log([...sameValueSet])
//=> [ 1, 0, -0, -1 ]

sameValueSet.delete(0)

console.log(sameValueSet.has(0))
//=> false

console.log(sameValueSet.has(-0))
//=> true
```

## Contributing

Stars are always welcome!

For bugs and feature requests,
[please create an issue](https://github.com/TomerAberbach/svkc/issues/new).

## License

[MIT](https://github.com/TomerAberbach/svkc/blob/main/license-mit) ©
[Tomer Aberbach](https://github.com/TomerAberbach) \
[Apache 2.0](https://github.com/TomerAberbach/svkc/blob/main/license-apache) ©
[Google](https://github.com/TomerAberbach/svkc/blob/main/notice-apache)
