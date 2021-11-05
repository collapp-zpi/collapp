import {
  ComponentProps,
  ComponentType,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useRouter } from 'next/router'
import { SWRConfig } from 'swr'

export const FilterContext = createContext<
  [FiltersType, (filters: FiltersType) => void, string[]]
>([{}, () => undefined, []])

type FilterProviderProps = {
  children: ReactNode
  inQuery?: string[]
  initial?: FiltersType
}
type FiltersType = { [key: string]: string }

export const FilterProvider = ({
  children,
  inQuery = [],
  initial = {},
}: FilterProviderProps) => {
  const getFiltersFromPath = (initial: FiltersType) => {
    const withPath = { ...initial }

    for (const param of inQuery) {
      const current = router.query?.[param]
      if (current) {
        withPath[param] = Array.isArray(current) ? current[0] : current
      } else if (withPath[param]) delete withPath[param]
    }

    return withPath
  }

  const router = useRouter()
  const [filters, setInnerFilters] = useState<FiltersType>(() =>
    getFiltersFromPath(initial),
  )

  useEffect(() => {
    const withPath = getFiltersFromPath(filters)
    setInnerFilters(withPath)
  }, [router.asPath])

  const setFilters = (newFilters: { [key: string]: string | null } = {}) => {
    const updated = { ...filters }

    for (const [param, value] of Object.entries(newFilters)) {
      if (value) updated[param] = value
      else if (updated[param]) delete updated[param]
    }

    let hasPathChanged = false
    for (const param of inQuery) {
      if (updated?.[param] && router.query?.[param] !== updated[param]) {
        hasPathChanged = true
        router.query[param] = updated[param]
      } else if (!updated?.[param] && router.query?.[param]) {
        hasPathChanged = true
        delete router.query[param]
      }
    }

    setInnerFilters(updated)
    if (hasPathChanged) {
      return router.replace(
        {
          pathname: router.pathname,
          query: router.query,
        },
        undefined,
        { shallow: true },
      )
    }
  }

  return (
    <FilterContext.Provider value={[filters, setFilters, inQuery]}>
      {children}
    </FilterContext.Provider>
  )
}

export const withFilters = <T extends ComponentType>(
  Component: T,
  inQuery: string[] = [],
  initial: FiltersType = {},
) =>
  function FilteredComponent({ fallback, ...props }: ComponentProps<T>) {
    const returnValue = (
      <FilterProvider {...{ inQuery, initial }}>
        <Component {...props} />
      </FilterProvider>
    )

    if (fallback) {
      return <SWRConfig value={{ fallback }}>{returnValue}</SWRConfig>
    }

    return returnValue
  }

export const useFilters = () => useContext(FilterContext)
