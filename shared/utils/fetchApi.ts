import { GetServerSidePropsContext } from 'next'
import { generateKey, QueryKey } from 'shared/utils/object'

export const fetchApi =
  (path = '', options?: RequestInit) =>
  (context: GetServerSidePropsContext) =>
    fetch(process.env.BASE_URL + path, {
      method: 'GET',
      ...options,
      headers: {
        ...(context?.req?.headers?.cookie && {
          cookie: context.req.headers.cookie,
        }),
        ...options?.headers,
      },
    })

export const fetchApiFallback =
  (context: GetServerSidePropsContext) =>
  async (key: QueryKey[], path = '', options?: RequestInit) => {
    const res = await fetchApi(path, options)(context)
    if (!res.ok) return

    const queryKey = generateKey(...key)
    return { [queryKey]: await res.json() }
  }
