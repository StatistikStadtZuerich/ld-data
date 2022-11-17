import extractKey from '../lib/routing/extractKey.js'
import findCubes from '../lib/routing/findCubes.js'
import readDimensionFilters from '../lib/routing/readDimensionFilters.js'
import readRoutes from '../lib/routing/readRoutes.js'
import readZeit from '../lib/routing/readZeit.js'

const config = {
  cubes: '../data/HDB_CUBES.csv',
  dimensions: '../data/HDB_DIMENSIONEN.csv',
  zeit: '../data/HDB_ZEIT.csv'
}

const iri = 'https://ld.stadt-zuerich.ch/statistics/GBF-ARA-GBA-XXX-XXX-XXX/observation/ARA2001-GBA2920-XXX0000-XXX0000-XXX0000-R30000-ZPJ001986'

async function main () {
  try {
    const zeit = await readZeit({
      filename: config.zeit
    })

    const dimensionFilters = await readDimensionFilters({
      filename: config.dimensions
    })

    const routes = await readRoutes({
      dimensionFilters,
      filename: config.cubes
    })

    const cubes = findCubes({
      key: extractKey(iri),
      routes,
      zeit
    })

    const newIri = iri.replace(/\/.{3}-.{3}-.{3}-.{3}-.{3}-.{3}\//, `/${cubes[0].id}/`)
    console.log(newIri)

    console.log(cubes)
  } catch (err) {
    console.error(err)
  }
}

main()
