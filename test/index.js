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

/* eslint-disable jest/no-standalone-expect */
import { fc, testProp } from 'tomer'
import { SameValueMap, SameValueSet } from '../src/index.js'
import toCommands from './helpers/to-commands.js'

const {
  clearCommand,
  deleteCommand,
  getCommand,
  hasCommand,
  addCommand,
  setCommand,
  sizeCommand,
  keysCommand,
  valuesCommand,
  entriesCommand,
  iterateCommand,
  forEachCommand,
  checkSameValueMapCommand,
  checkSameValueSetCommand,
} = toCommands({
  clear: (model, real) => {
    real.clear()
    model.clear()
  },
  delete: (model, real, value) => {
    expect(real.delete(value)).toBe(model.delete(value))
  },
  get: (model, real, key) => {
    expect(real.get(key)).toBe(model.get(key))
  },
  has: (model, real, value) => {
    expect(real.has(value)).toBe(model.has(value))
  },
  add: (model, real, value) => {
    expect(real.add(value)).toBe(real)
    model.add(value)
  },
  set: (model, real, [key, value]) => {
    expect(real.set(key, value)).toBe(real)
    model.set(key, value)
  },
  size: (model, real) => {
    expect(real.size).toBe(model.size)
  },
  keys: (model, real) => {
    const realKeys = real.keys()
    const modelKeys = model.keys()

    expect([...realKeys]).toStrictEqual([...modelKeys])
    expect([...realKeys]).toStrictEqual([...modelKeys])
  },
  values: (model, real) => {
    const realValues = real.values()
    const modelValues = model.values()

    expect([...realValues]).toStrictEqual([...modelValues])
    expect([...realValues]).toStrictEqual([...modelValues])
  },
  entries: (model, real) => {
    const realEntries = real.entries()
    const modelEntries = model.entries()

    expect([...realEntries]).toStrictEqual([...modelEntries])
    expect([...realEntries]).toStrictEqual([...modelEntries])
  },
  iterate: (model, real) => {
    expect([...real]).toStrictEqual([...model])
  },
  forEach: (model, real) => {
    const realArgs = []
    real.forEach((value, key, map) => {
      realArgs.push(value, key)
      expect(map).toBe(real)
    })

    const modelArgs = []
    model.forEach((value, key) => modelArgs.push(value, key))

    expect(realArgs).toStrictEqual(modelArgs)
  },
  checkSameValueMap: (_, real) => {
    const previousIteration = [...real]
    const previousEntries = [...real.entries()]
    const previousKeys = [...real.keys()]
    const previousValues = [...real.values()]

    const newSize = real.size + 2
    real.set(-0, `negative zero`)
    real.set(0, `zero`)

    expect([...real]).toStrictEqual(
      previousIteration.concat([
        [-0, `negative zero`],
        [0, `zero`],
      ]),
    )
    expect([...real.entries()]).toStrictEqual(
      previousEntries.concat([
        [-0, `negative zero`],
        [0, `zero`],
      ]),
    )
    expect([...real.keys()]).toStrictEqual(previousKeys.concat([-0, 0]))
    expect([...real.values()]).toStrictEqual(
      previousValues.concat([`negative zero`, `zero`]),
    )
    expect(real.get(-0)).toBe(`negative zero`)
    expect(real.get(0)).toBe(`zero`)
    expect(real.has(-0)).toBeTrue()
    expect(real.has(0)).toBeTrue()
    expect(real.size).toBe(newSize)

    real.delete(0)

    expect(real.has(-0)).toBeTrue()
    expect(real.get(-0)).toBe(`negative zero`)
    expect(real.has(0)).toBeFalse()
    expect(real.get(0)).toBeUndefined()

    real.delete(-0)
  },
  checkSameValueSet: (_, real) => {
    const previousIteration = [...real]
    const previousEntries = [...real.entries()]
    const previousKeys = [...real.keys()]
    const previousValues = [...real.values()]

    const newSize = real.size + 2
    real.add(-0)
    real.add(0)

    expect([...real]).toStrictEqual(previousIteration.concat([-0, 0]))
    expect([...real.entries()]).toStrictEqual(
      previousEntries.concat([
        [-0, -0],
        [0, 0],
      ]),
    )
    expect([...real.keys()]).toStrictEqual(previousKeys.concat([-0, 0]))
    expect([...real.values()]).toStrictEqual(previousValues.concat([-0, 0]))
    expect(real.has(-0)).toBeTrue()
    expect(real.has(0)).toBeTrue()
    expect(real.size).toBe(newSize)

    real.delete(0)

    expect(real.has(-0)).toBeTrue()
    expect(real.has(0)).toBeFalse()

    real.delete(-0)
  },
})

testProp(
  `SameValueMap behaves like Map with SameValue semantics`,
  [
    fc
      .array(fc.tuple(fc.anything().filter(value => value !== 0)), {
        minLength: 1,
      })
      .chain(entries => {
        const entriesArb = fc.constantFrom(...entries)
        const valuesArb = fc.constantFrom(...entries.flat())

        return fc.tuple(
          fc.oneof(
            fc.constant(undefined),
            fc.nat({ max: entries.length }).map(n => entries.slice(0, n)),
          ),
          fc.commands(
            [
              fc.constant(clearCommand()),
              valuesArb.map(deleteCommand),
              valuesArb.map(getCommand),
              valuesArb.map(hasCommand),
              entriesArb.map(setCommand),
              fc.constant(sizeCommand()),
              fc.constant(keysCommand()),
              fc.constant(valuesCommand()),
              fc.constant(entriesCommand()),
              fc.constant(iterateCommand()),
              fc.constant(forEachCommand()),
              fc.constant(checkSameValueMapCommand()),
            ],
            { maxCommands: 10_000 },
          ),
        )
      }),
  ],
  ([entries, commands]) => {
    fc.modelRun(
      () => ({
        model: new Map(entries),
        real: new SameValueMap(entries),
      }),
      commands,
    )

    expect.pass()
  },
)

test(`SameValueMap concrete example`, () => {
  const map = new SameValueMap([
    [1, 2],
    [2, 3],
    [-0, 1],
    [10, 3],
    [20, 1],
  ])

  expect(map.has(-0)).toBeTrue()
  expect(map.get(-0)).toBe(1)
  expect(map.has(0)).toBeFalse()
  expect([...map]).toStrictEqual([
    [1, 2],
    [2, 3],
    [-0, 1],
    [10, 3],
    [20, 1],
  ])
})

testProp(
  `SameValueSet behaves like Set with SameValue semantics`,
  [
    fc
      .array(
        fc.anything().filter(value => value !== 0),
        { minLength: 1 },
      )
      .chain(values => {
        const valuesArb = fc.constantFrom(...values)

        return fc.tuple(
          fc.oneof(
            fc.constant(undefined),
            fc.nat({ max: values.length }).map(n => values.slice(0, n)),
          ),
          fc.commands(
            [
              fc.constant(clearCommand()),
              valuesArb.map(deleteCommand),
              valuesArb.map(hasCommand),
              valuesArb.map(addCommand),
              fc.constant(sizeCommand()),
              fc.constant(keysCommand()),
              fc.constant(valuesCommand()),
              fc.constant(entriesCommand()),
              fc.constant(iterateCommand()),
              fc.constant(forEachCommand()),
              fc.constant(checkSameValueSetCommand()),
            ],
            { maxCommands: 10_000 },
          ),
        )
      }),
  ],
  ([values, commands]) => {
    fc.modelRun(
      () => ({
        model: new Set(values),
        real: new SameValueSet(values),
      }),
      commands,
    )

    expect.pass()
  },
)

test(`SameValueSet concrete example`, () => {
  const set = new SameValueSet([1, 2, -0, 10, 20])

  expect(set.has(-0)).toBeTrue()
  expect(set.has(0)).toBeFalse()
  expect([...set]).toStrictEqual([1, 2, -0, 10, 20])
})
