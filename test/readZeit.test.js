import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import readZeit from '../lib/routing/readZeit.js'

describe('readZeit', () => {
  it('should be a function', () => {
    strictEqual(typeof readZeit, 'function')
  })

  it('should return a Map', async () => {
    const zeit = await readZeit({
      filename: 'test/assets/zeit.csv'
    })

    strictEqual(zeit instanceof Map, true)
  })

  it('should read the zeit entries into the map', async () => {
    const zeit = await readZeit({
      filename: 'test/assets/zeit.csv'
    })

    strictEqual(zeit.has('Z01011601'), true)
    strictEqual(zeit.get('Z01011601').jahr, 1601)
    strictEqual(zeit.has('Z01011602'), true)
    strictEqual(zeit.get('Z01011602').jahr, 1602)
  })
})
