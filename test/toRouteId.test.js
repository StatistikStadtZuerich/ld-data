import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import toRouteId from '../lib/routing/toRouteId.js'

describe('toRouteId', () => {
  it('should be a function', () => {
    strictEqual(typeof toRouteId, 'function')
  })

  it('should build an id for a route based on kennzahl and dimensions', () => {
    const result = toRouteId({
      kennzahl: 'GBF',
      dimension1: 'ALT',
      dimension2: 'BBA',
      dimension3: 'HAA',
      dimension4: 'ARA',
      dimension5: 'BAP'
    })

    strictEqual(result, 'GBF-ALT-BBA-HAA-ARA-BAP')
  })

  it('should fill empty dimensions with XXX', () => {
    const result = toRouteId({ kennzahl: 'GBF' })

    strictEqual(result, 'GBF-XXX-XXX-XXX-XXX-XXX')
  })
})
