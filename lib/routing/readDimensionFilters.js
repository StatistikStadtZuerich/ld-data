import readCsv from './readCsv.js'
import toFilterId from './toFilterId.js'

async function readDimensionFilters ({ filename }) {
  const lines = await readCsv(filename)

  const dimensionFilters = new Map()

  for (const raw of lines) {
    const filtersStr = raw.dimensionfilter.trim()

    if (!filtersStr) {
      continue
    }

    const filters = filtersStr.split(';').map(filter => filter.trim())

    for (const filter of filters) {
      const id = toFilterId({ dimension: raw.dimension, filter })

      const dimensionFilter = dimensionFilters.get(id)

      if (!dimensionFilter) {
        dimensionFilters.set(id, {
          codes: new Set([raw.dimensioncode]),
          raw: [raw]
        })
      } else {
        dimensionFilter.codes.add(raw.dimensioncode)
        dimensionFilter.raw.push(raw)
      }
    }
  }

  return dimensionFilters
}

export default readDimensionFilters
