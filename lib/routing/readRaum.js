import readCsv from './readCsv.js'

async function readRaum ({ filename }) {
  const lines = await readCsv(filename)

  const raum = new Map()

  for (const raw of lines) {
    const raumfilters = raw.raumfilter.split(';').map(v => v.trim())

    for (const raumfilter of raumfilters) {
      let raumSet = raum.get(raumfilter)

      if (!raumSet) {
        raumSet = new Set([raw.raum])
        raum.set(raumfilter, raumSet)
      } else {
        raumSet.add(raw.raum)
      }
    }
  }

  return raum
}

export default readRaum
