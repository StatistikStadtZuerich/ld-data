function toRouteId ({
  kennzahl,
  dimension1,
  dimension2,
  dimension3,
  dimension4,
  dimension5
}) {
  return [
    kennzahl,
    dimension1 || 'XXX',
    dimension2 || 'XXX',
    dimension3 || 'XXX',
    dimension4 || 'XXX',
    dimension5 || 'XXX'
  ].join('-')
}

export default toRouteId
