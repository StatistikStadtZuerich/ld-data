import once from 'lodash/once.js'
import rdf from 'rdf-ext'
import { Transform } from 'readable-stream'
import extractKey from './routing/extractKey.js'
import findCubes from './routing/findCubes.js'
import readDimensionFilters from './routing/readDimensionFilters.js'
import readRaum from './routing/readRaum.js'
import readRoutes from './routing/readRoutes.js'
import readZeit from './routing/readZeit.js'

const cubeIdRegex = /\/.{3}-.{3}-.{3}-.{3}-.{3}-.{3}\//

class Router extends Transform {
  constructor ({ cubes, dimensions, raum, zeit }) {
    super({ objectMode: true })

    this.config = { cubes, dimensions, raum, zeit }

    this.init = once(this._init.bind(this))
    this.raum = null
    this.routes = null
    this.zeit = null
  }

  async _init () {
    const dimensionFilters = await readDimensionFilters({
      filename: this.config.dimensions
    })

    this.raum = await readRaum({
      filename: this.config.raum
    })

    this.routes = await readRoutes({
      dimensionFilters,
      filename: this.config.cubes
    })

    this.zeit = await readZeit({
      filename: this.config.zeit
    })
  }

  async _transform (quads, encoding, callback) {
    try {
      await this.init()

      const subjects = rdf.termSet([...quads].map(quad => quad.subject))

      if (subjects.size !== 1) {
        console.log([...subjects].map(s => s.value).join('\n'))
      }

      const mappedSubjects = this.mapTerm([...subjects][0])

      for (const subject of mappedSubjects) {
        this.push([...quads].map(quad => rdf.quad(subject, quad.predicate, quad.object, quad.graph)))
      }

      callback()
    } catch (err) {
      callback(err)
    }
  }

  mapTerm (term) {
    if (term.termType !== 'NamedNode') {
      return [term]
    }

    const key = extractKey(term.value)

    if (!key) {
      return [term]
    }

    const cubes = findCubes({ key, raum: this.raum, routes: this.routes, zeit: this.zeit })

    if (cubes.length === 0) {
      console.error(`no cube routing found for: <${term.value}>`)
    }

    return cubes.map(cube => {
      return rdf.namedNode(term.value.replace(cubeIdRegex, `/${cube.id}/`))
    })
  }
}

function factory ({ cubes, dimensions, raum, zeit }) {
  return new Router({ cubes, dimensions, raum, zeit })
}

export default factory
