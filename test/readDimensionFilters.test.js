import { deepStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import readDimensionFilters from '../lib/routing/readDimensionFilters.js'

describe('readDimensionFilters', () => {
  it('should be a function', () => {
    strictEqual(typeof readDimensionFilters, 'function')
  })

  it('should return a Map', async () => {
    const dimensionFilters = await readDimensionFilters({ filename: 'test/assets/dimensionen.csv' })

    strictEqual(dimensionFilters instanceof Map, true)
  })

  it('should read the filters from the given file', async () => {
    const dimensionFilters = await readDimensionFilters({ filename: 'test/assets/dimensionen.csv' })

    strictEqual(dimensionFilters.has('ARA (Neubau)'), true)
    deepStrictEqual([...dimensionFilters.get('ARA (Neubau)').codes.values()], ['ARA2001'])

    strictEqual(dimensionFilters.has('ARA (Neubau und Umbau)'), true)
    deepStrictEqual([...dimensionFilters.get('ARA (Neubau und Umbau)').codes.values()], ['ARA2001', 'ARA2002'])
  })
})
