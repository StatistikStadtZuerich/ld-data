import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import toFilterId from '../lib/routing/toFilterId.js'

describe('toFilterId', () => {
  it('should be a function', () => {
    strictEqual(typeof toFilterId, 'function')
  })

  it('should build an id for a filter based on dimension and filter', () => {
    const result = toFilterId({
      dimension: 'ARA',
      filter: 'Neubau'
    })

    strictEqual(result, 'ARA (Neubau)')
  })
})
