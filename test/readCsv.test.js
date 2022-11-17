import { deepStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import readCsv from '../lib/routing/readCsv.js'

describe('readCsv', () => {
  it('should be a function', () => {
    strictEqual(typeof readCsv, 'function')
  })

  it('should read the csv using the header keys lower case and trimmed', async () => {
    const expected = [{
      column1: 'value1a',
      column2: 'value2a'
    }, {
      column1: 'value1b',
      column2: 'value2b'
    }]

    const content = await readCsv('test/assets/simple.csv')

    deepStrictEqual(content, expected)
  })
})
