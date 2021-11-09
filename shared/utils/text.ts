export const truncate = (text = '', characters = 150) =>
  text
    ? text.substring(0, characters) + (text.length < characters ? '' : '...')
    : ''
