import { createReadStream } from 'fs'
import { parse } from 'csv-parse'
import getStream from 'get-stream'

async function readCsv (filename, { limit } = {}) {
  const input = createReadStream(filename)

  const parser = parse({
    columns: columns => columns.map(c => c.toLowerCase().trim()),
    to_line: limit
  })

  input.pipe(parser)

  return getStream.array(parser)
}

export default readCsv
