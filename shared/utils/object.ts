export const objectPick = (object: { [key: string]: any }, keys: string[]) =>
  keys.reduce(
    (acc, key) =>
      object[key] === undefined ? acc : { ...acc, [key]: object[key] },
    {},
  )

export type QueryKey = string | string[] | { [key: string]: string }

export const generateKey = (...items: QueryKey[]) =>
  items
    .reduce<string[]>((keys, item) => {
      if (typeof item === 'string') return [...keys, item]
      if (Array.isArray(item)) return [...keys, ...item]
      const ordered = Object.entries(item)
        .sort((a, b) => {
          const first = a[0].toUpperCase()
          const second = b[0].toUpperCase()
          return first < second ? -1 : first > second ? 1 : 0
        })
        .map(([key, value]) => `${key}=${value}`)
      return [...keys, ...ordered]
    }, [])
    .join(' ')
