import readCsv from './readCsv.js'

async function readZeit ({ filename }) {
  const lines = await readCsv(filename)

  const zeit = new Map()

  for (const raw of lines) {
    const line = { raw }

    line.id = raw.zeit
    line.jahr = parseInt(raw.jahr)

    zeit.set(line.id, line)
  }

  return zeit
}

export default readZeit
