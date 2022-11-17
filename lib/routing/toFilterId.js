function toFilterId ({ dimension, filter }) {
  return `${dimension} (${filter})`
}

export default toFilterId
