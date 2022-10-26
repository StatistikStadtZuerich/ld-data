import toRouteId from './toRouteId.js'

function matchesCubeDimension (cube, key, nr) {
  if (!cube[`dimensionCodes${nr}`]) {
    return true
  }

  return cube[`dimensionCodes${nr}`].has(key[`dimensionscode${nr}`])
}

function matchesJahr (cube, key, zeit) {
  const jahr = zeit.get(key.zeit)?.jahr

  if (!jahr) {
    console.error(`could not find ZEIT record for ${key.zeit}`)

    return false
  }

  return jahr >= cube.jahrvon && jahr <= cube.jahrbis
}

function matchesRaum (cube, key, raum) {
  if (!cube.raumfilter) {
    return true
  }

  const raumSet = raum.get(cube.raumfilter)

  if (!raumSet) {
    console.error(`could not find a raum set for ${cube.raumfilter}`)
  }

  return raumSet.has(key.raum)
}

function findCubes ({
  key,
  raum,
  routes,
  zeit
}) {
  const route = routes.get(toRouteId(key))

  if (!route) {
    return []
  }

  return route.filter(cube => {
    return (
      matchesCubeDimension(cube, key, '1') &&
      matchesCubeDimension(cube, key, '2') &&
      matchesCubeDimension(cube, key, '3') &&
      matchesCubeDimension(cube, key, '4') &&
      matchesCubeDimension(cube, key, '5') &&
      matchesJahr(cube, key, zeit) &&
      matchesRaum(cube, key, raum)
    )
  })
}

export default findCubes
