import { GetServerSidePropsContext } from 'next'

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
