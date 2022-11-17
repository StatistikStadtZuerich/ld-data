const extract = /(.{3})-(.{3})-(.{3})-(.{3})-(.{3})-(.{3})\/[^/]+\/(.{7})-(.{7})-(.{7})-(.{7})-(.{7})-(.{6})-(.{9})$/

function extractKey (iri) {
  const result = iri.match(extract)

  if (!result) {
    return null
  }

  const [
    ,
    kennzahl,
    dimension1,
    dimension2,
    dimension3,
    dimension4,
    dimension5,
    dimensionscode1,
    dimensionscode2,
    dimensionscode3,
    dimensionscode4,
    dimensionscode5,
    raum,
    zeit
  ] = result

  return {
    kennzahl,
    dimension1,
    dimension2,
    dimension3,
    dimension4,
    dimension5,
    dimensionscode1,
    dimensionscode2,
    dimensionscode3,
    dimensionscode4,
    dimensionscode5,
    raum,
    zeit
  }
}

export default extractKey
