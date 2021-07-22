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

import test from 'ava'
import { fc, testProp } from 'ava-fast-check'
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
  clear(t, model, real) {
    real.clear()
    model.clear()
  },
  delete(t, model, real, value) {
    t.is(real.delete(value), model.delete(value))
  },
  get(t, model, real, key) {
    t.is(real.get(key), model.get(key))
  },
  has(t, model, real, value) {
    t.is(real.has(value), model.has(value))
  },
  add(t, model, real, value) {
    t.is(real.add(value), real)
    model.add(value)
  },
  set(t, model, real, [key, value]) {
    t.is(real.set(key, value), real)
    model.set(key, value)
  },
  size(t, model, real) {
    t.is(real.size, model.size)
  },
  keys(t, model, real) {
    const realKeys = real.keys()
    const modelKeys = model.keys()

    t.deepEqual([...realKeys], [...modelKeys])
    t.deepEqual([...realKeys], [...modelKeys])
  },
  values(t, model, real) {
    const realValues = real.values()
    const modelValues = model.values()

    t.deepEqual([...realValues], [...modelValues])
    t.deepEqual([...realValues], [...modelValues])
  },
  entries(t, model, real) {
    const realEntries = real.entries()
    const modelEntries = model.entries()

    t.deepEqual([...realEntries], [...modelEntries])
    t.deepEqual([...realEntries], [...modelEntries])
  },
  iterate(t, model, real) {
    t.deepEqual([...real], [...model])
  },
  forEach(t, model, real) {
    const realArgs = []
    real.forEach((value, key, map) => {
      realArgs.push(value, key)
      t.is(map, real)
    })

    const modelArgs = []
    model.forEach((value, key) => modelArgs.push(value, key))

    t.deepEqual(realArgs, modelArgs)
  },
  checkSameValueMap(t, model, real) {
    const previousIteration = [...real]
    const previousEntries = [...real.entries()]
    const previousKeys = [...real.keys()]
    const previousValues = [...real.values()]

    const newSize = real.size + 2
    real.set(-0, `negative zero`)
    real.set(0, `zero`)

    t.deepEqual(
      [...real],
      previousIteration.concat([
        [-0, `negative zero`],
        [0, `zero`],
      ]),
    )
    t.deepEqual(
      [...real.entries()],
      previousEntries.concat([
        [-0, `negative zero`],
        [0, `zero`],
      ]),
    )
    t.deepEqual([...real.keys()], previousKeys.concat([-0, 0]))
    t.deepEqual(
      [...real.values()],
      previousValues.concat([`negative zero`, `zero`]),
    )
    t.is(real.get(-0), `negative zero`)
    t.is(real.get(0), `zero`)
    t.true(real.has(-0))
    t.true(real.has(0))
    t.is(real.size, newSize)

    real.delete(0)

    t.true(real.has(-0))
    t.is(real.get(-0), `negative zero`)
    t.false(real.has(0))
    t.is(real.get(0), undefined)

    real.delete(-0)
  },
  checkSameValueSet(t, model, real) {
    const previousIteration = [...real]
    const previousEntries = [...real.entries()]
    const previousKeys = [...real.keys()]
    const previousValues = [...real.values()]

    const newSize = real.size + 2
    real.add(-0)
    real.add(0)

    t.deepEqual([...real], previousIteration.concat([-0, 0]))
    t.deepEqual(
      [...real.entries()],
      previousEntries.concat([
        [-0, -0],
        [0, 0],
      ]),
    )
    t.deepEqual([...real.keys()], previousKeys.concat([-0, 0]))
    t.deepEqual([...real.values()], previousValues.concat([-0, 0]))
    t.true(real.has(-0))
    t.true(real.has(0))
    t.is(real.size, newSize)

    real.delete(0)

    t.true(real.has(-0))
    t.false(real.has(0))

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
            { maxCommands: 10000 },
          ),
        )
      }),
  ],
  (t, [entries, commands]) => {
    fc.modelRun(
      () => ({
        model: { t, model: new Map(entries) },
        real: new SameValueMap(entries),
      }),
      commands,
    )

    t.pass()
  },
)

test(`SameValueMap concrete example`, t => {
  const map = new SameValueMap([
    [1, 2],
    [2, 3],
    [-0, 1],
    [10, 3],
    [20, 1],
  ])

  t.true(map.has(-0))
  t.is(map.get(-0), 1)
  t.false(map.has(0))
  t.deepEqual(
    [...map],
    [
      [1, 2],
      [2, 3],
      [-0, 1],
      [10, 3],
      [20, 1],
    ],
  )
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
            { maxCommands: 10000 },
          ),
        )
      }),
  ],
  (t, [values, commands]) => {
    fc.modelRun(
      () => ({
        model: { t, model: new Set(values) },
        real: new SameValueSet(values),
      }),
      commands,
    )

    t.pass()
  },
)

test(`SameValueSet concrete example`, t => {
  const set = new SameValueSet([1, 2, -0, 10, 20])

  t.true(set.has(-0))
  t.false(set.has(0))
  t.deepEqual([...set], [1, 2, -0, 10, 20])
})
