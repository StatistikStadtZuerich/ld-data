import { deepStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import extractKey from '../lib/routing/extractKey.js'

describe('extractKey', () => {
  it('should be a function', () => {
    strictEqual(typeof extractKey, 'function')
  })

  it('should extract they key from the given IRI', async () => {
    const iri = 'https://ld.stadt-zuerich.ch/statistics/GBF-ARA-GBA-XXX-XXX-XXX/observation/ARA2001-GBA2920-XXX0000-XXX0000-XXX0000-R30000-ZPJ001986'
    const expected = {
      dimension1: 'ARA',
      dimension2: 'GBA',
      dimension3: 'XXX',
      dimension4: 'XXX',
      dimension5: 'XXX',
      dimensionscode1: 'ARA2001',
      dimensionscode2: 'GBA2920',
      dimensionscode3: 'XXX0000',
      dimensionscode4: 'XXX0000',
      dimensionscode5: 'XXX0000',
      kennzahl: 'GBF',
      raum: 'R30000',
      zeit: 'ZPJ001986'
    }

    const key = extractKey(iri)

    deepStrictEqual(key, expected)
  })
})
