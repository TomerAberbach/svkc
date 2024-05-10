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

import { fc, test } from 'tomer'
import { SameValueMap, SameValueSet } from '../src/index.js'

test.prop([
  fc
    .array(
      fc.tuple(
        fc.anything().filter(value => value !== 0),
        fc.anything(),
      ),
      { minLength: 1 },
    )
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
            fc.constant({
              check: () => true,
              run: (
                model: Map<unknown, unknown>,
                real: Map<unknown, unknown>,
              ) => {
                model.clear()
                real.clear()
              },
              toString: () => `clear()`,
            }),
            valuesArb.map(key => ({
              check: () => true,
              run: (
                model: Map<unknown, unknown>,
                real: Map<unknown, unknown>,
              ) => expect(real.delete(key)).toBe(model.delete(key)),
              toString: () => `delete(${fc.stringify(key)})`,
            })),
            valuesArb.map(key => ({
              check: () => true,
              run: (
                model: Map<unknown, unknown>,
                real: Map<unknown, unknown>,
              ) => expect(real.get(key)).toBe(model.get(key)),
              toString: () => `get(${fc.stringify(key)})`,
            })),
            valuesArb.map(key => ({
              check: () => true,
              run: (
                model: Map<unknown, unknown>,
                real: Map<unknown, unknown>,
              ) => expect(real.has(key)).toBe(model.has(key)),
              toString: () => `has(${fc.stringify(key)})`,
            })),
            entriesArb.map(([key, value]) => ({
              check: () => true,
              run: (
                model: Map<unknown, unknown>,
                real: Map<unknown, unknown>,
              ) => {
                model.set(key, value)
                expect(real.set(key, value)).toBe(real)
              },
              toString: () =>
                `set(${fc.stringify(key)}, ${fc.stringify(value)})`,
            })),
            fc.constant({
              check: () => true,
              run: (
                model: Map<unknown, unknown>,
                real: Map<unknown, unknown>,
              ) => expect(real.size).toBe(model.size),
              toString: () => `size()`,
            }),
            fc.constant({
              check: () => true,
              run: (
                model: Map<unknown, unknown>,
                real: Map<unknown, unknown>,
              ) => {
                const modelKeys = model.keys()
                const realKeys = real.keys()
                expect([...realKeys]).toStrictEqual([...modelKeys])
                expect([...realKeys]).toStrictEqual([...modelKeys])
              },
              toString: () => `keys()`,
            }),
            fc.constant({
              check: () => true,
              run: (
                model: Map<unknown, unknown>,
                real: Map<unknown, unknown>,
              ) => {
                const modelValues = model.values()
                const realValues = real.values()
                expect([...realValues]).toStrictEqual([...modelValues])
                expect([...realValues]).toStrictEqual([...modelValues])
              },
              toString: () => `values()`,
            }),
            fc.constant({
              check: () => true,
              run: (
                model: Map<unknown, unknown>,
                real: Map<unknown, unknown>,
              ) => {
                const modelEntries = model.entries()
                const realEntries = real.entries()
                expect([...realEntries]).toStrictEqual([...modelEntries])
                expect([...realEntries]).toStrictEqual([...modelEntries])
              },
              toString: () => `entries()`,
            }),
            fc.constant({
              check: () => true,
              run: (
                model: Map<unknown, unknown>,
                real: Map<unknown, unknown>,
              ) => expect([...real]).toStrictEqual([...model]),
              toString: () => `iterate()`,
            }),
            fc.constant({
              check: () => true,
              run: (
                model: Map<unknown, unknown>,
                real: Map<unknown, unknown>,
              ) => {
                const modelArgs: unknown[] = []
                model.forEach((value, key) => modelArgs.push(value, key))

                const realArgs: unknown[] = []
                real.forEach((value, key, map) => {
                  realArgs.push(value, key)
                  expect(map).toBe(real)
                })

                expect(realArgs).toStrictEqual(modelArgs)
              },
              toString: () => `forEach()`,
            }),
            fc.constant({
              check: () => true,
              run: (
                model: Map<unknown, unknown>,
                real: Map<unknown, unknown>,
              ) => {
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
                expect([...real.keys()]).toStrictEqual(
                  previousKeys.concat([-0, 0]),
                )
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
              toString: () => `checkSameValueMap()`,
            }),
          ],
          { maxCommands: 10_000 },
        ),
      )
    }),
])(
  `SameValueMap behaves like Map with SameValue semantics`,
  ([entries, commands]) => {
    fc.modelRun(
      () => ({
        model: new Map(entries),
        real: new SameValueMap(entries),
      }),
      commands,
    )
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

test.prop([
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
            fc.constant({
              check: () => true,
              run: (model: Set<unknown>, real: Set<unknown>) => {
                model.clear()
                real.clear()
              },
              toString: () => `clear()`,
            }),
            valuesArb.map(value => ({
              check: () => true,
              run: (model: Set<unknown>, real: Set<unknown>) =>
                expect(real.delete(value)).toBe(model.delete(value)),
              toString: () => `delete(${fc.stringify(value)})`,
            })),
            valuesArb.map(value => ({
              check: () => true,
              run: (model: Set<unknown>, real: Set<unknown>) =>
                expect(real.has(value)).toBe(model.has(value)),
              toString: () => `has(${fc.stringify(value)})`,
            })),
            valuesArb.map(value => ({
              check: () => true,
              run: (model: Set<unknown>, real: Set<unknown>) => {
                model.add(value)
                expect(real.add(value)).toBe(real)
              },
              toString: () => `add(${fc.stringify(value)})`,
            })),
            fc.constant({
              check: () => true,
              run: (model: Set<unknown>, real: Set<unknown>) =>
                expect(real.size).toBe(model.size),
              toString: () => `size()`,
            }),
            fc.constant({
              check: () => true,
              run: (model: Set<unknown>, real: Set<unknown>) => {
                const modelKeys = model.keys()
                const realKeys = real.keys()
                expect([...realKeys]).toStrictEqual([...modelKeys])
                expect([...realKeys]).toStrictEqual([...modelKeys])
              },
              toString: () => `keys()`,
            }),
            fc.constant({
              check: () => true,
              run: (model: Set<unknown>, real: Set<unknown>) => {
                const modelValues = model.values()
                const realValues = real.values()
                expect([...realValues]).toStrictEqual([...modelValues])
                expect([...realValues]).toStrictEqual([...modelValues])
              },
              toString: () => `values()`,
            }),
            fc.constant({
              check: () => true,
              run: (model: Set<unknown>, real: Set<unknown>) => {
                const modelEntries = model.entries()
                const realEntries = real.entries()
                expect([...realEntries]).toStrictEqual([...modelEntries])
                expect([...realEntries]).toStrictEqual([...modelEntries])
              },
              toString: () => `entries()`,
            }),
            fc.constant({
              check: () => true,
              run: (model: Set<unknown>, real: Set<unknown>) =>
                expect([...real]).toStrictEqual([...model]),
              toString: () => `iterate()`,
            }),
            fc.constant({
              check: () => true,
              run: (model: Set<unknown>, real: Set<unknown>) => {
                const modelArgs: unknown[] = []
                model.forEach((value, key) => modelArgs.push(value, key))

                const realArgs: unknown[] = []
                real.forEach((value, key, map) => {
                  realArgs.push(value, key)
                  expect(map).toBe(real)
                })

                expect(realArgs).toStrictEqual(modelArgs)
              },
              toString: () => `forEach()`,
            }),
            fc.constant({
              check: () => true,
              run: (model: Set<unknown>, real: Set<unknown>) => {
                const previousIteration = [...real]
                const previousEntries = [...real.entries()]
                const previousKeys = [...real.keys()]
                const previousValues = [...real.values()]

                const newSize = real.size + 2
                real.add(-0)
                real.add(0)

                expect([...real]).toStrictEqual(
                  previousIteration.concat([-0, 0]),
                )
                expect([...real.entries()]).toStrictEqual(
                  previousEntries.concat([
                    [-0, -0],
                    [0, 0],
                  ]),
                )
                expect([...real.keys()]).toStrictEqual(
                  previousKeys.concat([-0, 0]),
                )
                expect([...real.values()]).toStrictEqual(
                  previousValues.concat([-0, 0]),
                )
                expect(real.has(-0)).toBeTrue()
                expect(real.has(0)).toBeTrue()
                expect(real.size).toBe(newSize)

                real.delete(0)

                expect(real.has(-0)).toBeTrue()
                expect(real.has(0)).toBeFalse()

                real.delete(-0)
              },
              toString: () => `checkSameValueSet()`,
            }),
          ],
          { maxCommands: 10_000 },
        ),
      )
    }),
])(
  `SameValueSet behaves like Set with SameValue semantics`,
  ([values, commands]) => {
    fc.modelRun(
      () => ({
        model: new Set(values),
        real: new SameValueSet(values),
      }),
      commands,
    )
  },
)

test(`SameValueSet concrete example`, () => {
  const set = new SameValueSet([1, 2, -0, 10, 20])

  expect(set.has(-0)).toBeTrue()
  expect(set.has(0)).toBeFalse()
  expect([...set]).toStrictEqual([1, 2, -0, 10, 20])
})
