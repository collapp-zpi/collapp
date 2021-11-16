import { GetServerSidePropsContext } from 'next'

const baseUrl = process.env.VERCEL_URL || process.env.BASE_URL

export const fetchApi =
  (path = '', options?: RequestInit) =>
  (context: GetServerSidePropsContext) =>
    fetch(baseUrl + path, {
      method: 'GET',
      ...options,
      headers: {
        ...(context?.req?.headers?.cookie && {
          cookie: context.req.headers.cookie,
        }),
        ...options?.headers,
      },
    })
