/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const negativeZero = Symbol(`-0`)

const encode = value => (Object.is(value, -0) ? negativeZero : value)
const decode = value => (value === negativeZero ? -0 : value)

const mixinCommonMethods = Keyed =>
  class extends Keyed {
    delete(value) {
      return super.delete(encode(value))
    }

    has(value) {
      return super.has(encode(value))
    }

    forEach(callbackFn, thisArg) {
      for (const [key, value] of this.entries()) {
        callbackFn.call(thisArg, value, key, this)
      }
    }
  }

export class SameValueMap extends mixinCommonMethods(Map) {
  get(key) {
    return super.get(encode(key))
  }

  set(key, value) {
    return super.set(encode(key), value)
  }

  *keys() {
    for (const key of super.keys()) {
      yield decode(key)
    }
  }

  *entries() {
    for (const [key, value] of super.entries()) {
      yield [decode(key), value]
    }
  }

  *[Symbol.iterator]() {
    yield* this.entries()
  }
}

export class SameValueSet extends mixinCommonMethods(Set) {
  add(value) {
    return super.add(encode(value))
  }

  keys() {
    return this.values()
  }

  *values() {
    for (const value of super.values()) {
      yield decode(value)
    }
  }

  *entries() {
    for (const value of this.values()) {
      yield [value, value]
    }
  }

  *[Symbol.iterator]() {
    yield* this.values()
  }
}
