import once from 'lodash/once.js'
import rdf from 'rdf-ext'
import { Transform } from 'readable-stream'
import * as ns from './namespaces.js'
import readDimensionFilters from './routing/readDimensionFilters.js'
import readRoutes from './routing/readRoutes.js'

class RouterNames extends Transform {
  constructor ({ baseIri, cubes, dimensions }) {
    super({ objectMode: true })

    this.config = { baseIri, cubes, dimensions }

    this.init = once(this._init.bind(this))
    this.routes = null
  }

  async _init () {
    const dimensionFilters = await readDimensionFilters({
      filename: this.config.dimensions
    })

    this.routes = await readRoutes({
      dimensionFilters,
      filename: this.config.cubes
    })

    for (const route of this.routes.values()) {
      for (const cube of route) {
        const cubeUrl = new URL(cube.id, this.config.baseIri)
        const cubeTerm = rdf.namedNode(cubeUrl.toString())
        const name = rdf.literal(cube.titel)

        this.push(rdf.quad(cubeTerm, ns.schema.name, name))
      }
    }
  }

  async _transform (quad, encoding, callback) {
    try {
      await this.init()

      callback(null, quad)
    } catch (err) {
      callback(err)
    }
  }
}

function factory ({ baseIri, cubes, dimensions }) {
  return new RouterNames({ baseIri, cubes, dimensions })
}

export default factory
