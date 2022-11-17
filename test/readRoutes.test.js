import { deepStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import readRoutes from '../lib/routing/readRoutes.js'

describe('readRoutes', () => {
  it('should be a function', () => {
    strictEqual(typeof readRoutes, 'function')
  })

  it('should return a Map', async () => {
    const routes = await readRoutes({
      dimensionFilters: new Map(),
      filename: 'test/assets/cubes.csv'
    })

    strictEqual(routes instanceof Map, true)
  })

  it('should read the cube definitions into the routing map', async () => {
    const routes = await readRoutes({
      dimensionFilters: new Map(),
      filename: 'test/assets/cubes.csv'
    })

    strictEqual(routes.has('BEW-ALT-XXX-XXX-XXX-XXX'), true)
    strictEqual(routes.has('GBF-ARA-GBA-XXX-XXX-XXX'), true)

    const cube = routes.get('GBF-ARA-GBA-XXX-XXX-XXX')[0]
    strictEqual(cube.kennzahl, 'GBF')
    strictEqual(cube.dimension1, 'ARA')
    strictEqual(cube.dimension2, 'GBA')
    strictEqual(cube.dimension3, 'XXX')
    strictEqual(cube.dimension4, 'XXX')
    strictEqual(cube.dimension5, 'XXX')
  })

  it('should add the dimension codes for the defined filters', async () => {
    const routes = await readRoutes({
      dimensionFilters: new Map([
        ['ARA (Neubau)', { codes: new Set(['ARA2001']) }]
      ]),
      filename: 'test/assets/cubes.csv'
    })

    const cube = routes.get('GBF-ARA-GBA-XXX-XXX-XXX')[0]
    strictEqual(cube.kennzahl, 'GBF')
    deepStrictEqual([...cube.dimensionCodes1.values()], ['ARA2001'])
  })
})
