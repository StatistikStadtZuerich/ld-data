import rdf from 'rdf-ext'
import urlSlug from 'url-slug'

function toNumber (quad) {
  if (quad.predicate.value.startsWith('http://example.org/measure/')) {
    const value = quad.object.value.split(' ').join('') // fixes numbers with spaces in it, ideally this should not happen anymore in the data
    const predicateUri = 'https://ld.stadt-zuerich.ch/statistics/measure/' + quad.predicate.value.slice('http://example.org/measure/'.length)

    let valnumber

    if (isNaN(parseFloat(value))) {
      // TODO check if we should keep the original value somewhere. We now simply kick it out and replace it with NaN
      // might be something for annotations instead
      // In case we do not get a parsable number we create a string out of it (on a special qb:MeasureProperty)
      // predicateUri = 'https://ld.stadt-zuerich.ch/statistics/measure/KENNWERT'
      quad.object = rdf.literal('NaN', rdf.namedNode('http://www.w3.org/2001/XMLSchema#double'))
    } else {
      valnumber = parseFloat(value)
      quad.object = rdf.literal(valnumber, rdf.namedNode('http://www.w3.org/2001/XMLSchema#double'))
    }

    quad.predicate = rdf.namedNode(predicateUri)
  }
  return rdf.quad(quad.subject, quad.predicate, quad.object)
}

function toBoolean (quad) {
  if (quad.predicate.value === 'http://example.org/UPDATE') {
    const conditions = ['QUE', 'KZE', 'WRT']
    const included = conditions.some(el => quad.object.value.includes(el))
    quad.predicate = rdf.namedNode('https://ld.stadt-zuerich.ch/statistics/attribute/KORREKTUR')

    if (included) {
      quad.object = rdf.literal('true', 'http://www.w3.org/2001/XMLSchema#boolean')
    } else {
      quad.object = rdf.literal('false', 'http://www.w3.org/2001/XMLSchema#boolean')
    }
  }
  return rdf.quad(quad.subject, quad.predicate, quad.object)
}

function toISODate (quad) {
  if (quad.predicate.value === 'https://ld.stadt-zuerich.ch/statistics/property/TIME') {
    const year = quad.object.value.substring(24, 28)
    const month = quad.object.value.substring(29, 31)
    const day = quad.object.value.substring(32, 34)

    if (((day === 'XX') && (month === 'XX'))) {
      quad.object = rdf.literal(year, rdf.namedNode('http://www.w3.org/2001/XMLSchema#gYear'))
    } else if (day === 'XX') {
      quad.object = rdf.literal(year + '-' + month, rdf.namedNode('http://www.w3.org/2001/XMLSchema#gYearMonth'))
    } else {
      quad.object = rdf.literal(year + '-' + month + '-' + day, rdf.namedNode('http://www.w3.org/2001/XMLSchema#date'))
    }
  }
  return rdf.quad(quad.subject, quad.predicate, quad.object)
}

// TODO
// This might be removed if we stay with DefinedTermSet. 
function referenceTimeToIri (quad) {
  if (quad.predicate.value === 'https://ld.stadt-zuerich.ch/schema/referenceTime') {
    const referenceTime = quad.object.value.split(';')
    return referenceTime.map(x => rdf.quad(quad.subject, quad.predicate, rdf.namedNode('https://ld.stadt-zuerich.ch/statistics/code/' + x.trim())))
  } else {
    return [quad]
  }
}

function createZeitDefinedTermSet (quad) {
  if (quad.predicate.value === 'https://ld.stadt-zuerich.ch/schema/referenceTime') {
    const quads = []
    const concepts = quad.object.value.split(';')

    concepts.forEach(concept => {
      const member = quad.subject
      const subject = rdf.namedNode('https://ld.stadt-zuerich.ch/statistics/termset/' + (concept.trim().replaceAll(' ', '_')))
      const label = rdf.literal(concept.trim())
      quads.push(rdf.quad(subject, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), rdf.namedNode('http://schema.org/DefinedTermSet')))
      quads.push(rdf.quad(subject, rdf.namedNode('http://schema.org/name'), label))
      quads.push(rdf.quad(subject, rdf.namedNode('http://schema.org/identifier'), label))
      quads.push(rdf.quad(subject, rdf.namedNode('http://schema.org/hasDefinedTerm'), member))
      quads.push(rdf.quad(member, rdf.namedNode('http://schema.org/inDefinedTermSet'), subject))
      quads.push(rdf.quad(subject, rdf.namedNode('https://ld.stadt-zuerich.ch/schema/filterOf'), rdf.namedNode('https://ld.stadt-zuerich.ch/statistics/property/ZEIT')))
    })

    return quads
  } else {
    return [quad]
  }
}

function createRaumDefinedTermSet (quad) {
  if (quad.predicate.value === 'http://example.org/raumfilter') {
    const quads = []
    const concepts = quad.object.value.split(';')

    concepts.forEach(concept => {
      const member = quad.subject
      const subject = rdf.namedNode('https://ld.stadt-zuerich.ch/statistics/termset/' + (concept.trim().replaceAll(' ', '_')))
      const label = rdf.literal(concept.trim())
      quads.push(rdf.quad(subject, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), rdf.namedNode('http://schema.org/DefinedTermSet')))
      quads.push(rdf.quad(subject, rdf.namedNode('http://schema.org/name'), label))
      quads.push(rdf.quad(subject, rdf.namedNode('http://schema.org/identifier'), label))
      quads.push(rdf.quad(subject, rdf.namedNode('http://schema.org/hasDefinedTerm'), member))
      quads.push(rdf.quad(member, rdf.namedNode('http://schema.org/inDefinedTermSet'), subject))
      quads.push(rdf.quad(subject, rdf.namedNode('https://ld.stadt-zuerich.ch/schema/filterOf'), rdf.namedNode('https://ld.stadt-zuerich.ch/statistics/property/RAUM')))
    })

    return quads
  } else {
    return [quad]
  }
}

function createDimensionDefinedTermSet (quad) {
  if (quad.predicate.value === 'http://example.org/dimensionsfilter') {
    const quads = []
    const parameter = quad.object.value.substr(12) // -> BEW/MyFilter
    const dimension = parameter.split('/')[0] // -> BEW
    const concepts = decodeURIComponent(parameter.split('/')[1]).split(';') // MyFilter, can be multiple.

    concepts.forEach(concept => {
      const slugIri = urlSlug.convert(concept.trim(), {
        separator: '',
        transformer: urlSlug.TITLECASE_TRANSFORMER
      })
      //console.log(`Filter: ${concept}, slug: ${slugIri}`)
      const member = quad.subject
      const subject = rdf.namedNode('https://ld.stadt-zuerich.ch/statistics/termset/' + slugIri)
      const label = rdf.literal(concept.trim())
      quads.push(rdf.quad(subject, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), rdf.namedNode('http://schema.org/DefinedTermSet')))
      quads.push(rdf.quad(subject, rdf.namedNode('http://schema.org/name'), label))
      quads.push(rdf.quad(subject, rdf.namedNode('http://schema.org/identifier'), label))
      quads.push(rdf.quad(subject, rdf.namedNode('http://schema.org/hasDefinedTerm'), member))
      quads.push(rdf.quad(member, rdf.namedNode('http://schema.org/inDefinedTermSet'), subject))
      quads.push(rdf.quad(subject, rdf.namedNode('https://ld.stadt-zuerich.ch/schema/filterOf'), rdf.namedNode(`https://ld.stadt-zuerich.ch/statistics/property/${dimension}`)))
    })

    return quads
  } else {
    return [quad]
  }
}

function createRaumHierarchie (quad) {
  if (quad.predicate.value === 'http://example.org/containsraum') {
    const quads = []
    const raums = quad.object.value.split(',')

    raums.forEach(raum => {
      const padded = `00000${raum.trim()}`
      const iri = rdf.namedNode(`https://ld.stadt-zuerich.ch/statistics/code/R${padded.substring(padded.length - 5)}`)
      quads.push(rdf.quad(quad.subject, rdf.namedNode('http://schema.org/containsPlace'), iri))
    })

    return quads
  } else {
    return [quad]
  }
}

function sameAsIri (quad) {
  if (quad.predicate.value === 'http://schema.org/sameAs') {
    return rdf.quad(quad.subject, quad.predicate, rdf.namedNode(quad.object.value))
  } else {
    return quad
  }
}

function removeXxx (quad) {
  if (quad.subject.value.endsWith('XXX0000')) {
    const prettyIri = quad.subject.value.replaceAll('XXX0000', '')
    quad.subject = rdf.namedNode(prettyIri)
    if (quad.predicate.value === 'http://schema.org/identifier') {
      const prettyId = quad.object.value.replaceAll('XXX0000', '')
      quad.object = rdf.literal(prettyId)
    }
  }
  return rdf.quad(quad.subject, quad.predicate, quad.object)
}

function all (quad) {
  return toNumber(toISODate(quad))
}

export {
  all,
  toNumber,
  toBoolean,
  toISODate,
  referenceTimeToIri,
  removeXxx,
  createRaumDefinedTermSet,
  createZeitDefinedTermSet,
  createDimensionDefinedTermSet,
  createRaumHierarchie,
  sameAsIri
}
