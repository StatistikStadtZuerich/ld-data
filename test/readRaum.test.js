import { deepStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import readRaum from '../lib/routing/readRaum.js'

describe('readRaum', () => {
  it('should be a function', () => {
    strictEqual(typeof readRaum, 'function')
  })

  it('should return a Map', async () => {
    const zeit = await readRaum({
      filename: 'test/assets/raum.csv'
    })

    strictEqual(zeit instanceof Map, true)
  })

  it('should read the raum entries into the map', async () => {
    const raum = await readRaum({
      filename: 'test/assets/raum.csv'
    })

    strictEqual(raum.has('KantonZH'), true)
    deepStrictEqual(raum.get('KantonZH'), new Set(['R20000', 'R30000']))
    strictEqual(raum.has('StadtZH'), true)
    deepStrictEqual(raum.get('StadtZH'), new Set(['R20000', 'R30000']))
    strictEqual(raum.has('SchulkreisZH'), true)
    deepStrictEqual(raum.get('SchulkreisZH'), new Set(['R30001']))
  })
})
