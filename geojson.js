
const p = require('barnard59')
const parseGeoJson = require('./lib/parse-geojson')

const files = [{
  input: 'stadtkreise.json',
  output: 'stadtkreise.nt',
  subject: 'https://ld.stadt-zuerich.ch/geo/geometry/kreis/${knr}' // eslint-disable-line no-template-curly-in-string
}, {
  input: 'statistische_quartiere.json',
  output: 'statistische_quartiere.nt',
  subject: 'https://ld.stadt-zuerich.ch/geo/geometry/quartier/${qnr}' // eslint-disable-line no-template-curly-in-string
} /*, {
  input: 'schulkreis.json',
  output: 'schulkreis.nt',
  subject: 'http://ld.stadt-zuerich.ch/geo/geometry/schulkreis/${qnr}'
 }, {
  input: 'wahlkreis.json',
  output: 'wahlkreis.nt',
  subject: 'http://ld.stadt-zuerich.ch/geo/geometry/wahlkreis/${qnr}'
} */]

Promise.all(files.map(file => {
  const stream =
    p.file.read('tmp/' + file.input)
      .pipe(parseGeoJson(file.subject, 'http://www.opengis.net/ont/geosparql#asWKT'))
      .pipe(p.ntriples.serialize())
      .pipe(p.file.write('target/geo_' + file.output))

  return p.run(stream)
}))
