import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import { withFilters } from 'shared/hooks/useFilters'
import { useQuery } from 'shared/hooks/useQuery'
import { LogoSpinner } from 'shared/components/LogoSpinner'
import { generateKey, objectPick } from 'shared/utils/object'
import { CgMathPlus } from 'react-icons/cg'
import Link from 'next/link'
import { Layout } from 'layouts/Layout'
import { withAuth } from 'shared/hooks/useAuth'
import { ErrorInfo } from 'shared/components/ErrorInfo'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const params = objectPick(context.query, ['limit', 'page'])
  const search = new URLSearchParams(params)

  const res = await fetch(`${process.env.BASE_URL}/api/spaces?${search}`, {
    method: 'GET',
    headers: {
      ...(context?.req?.headers?.cookie && {
        cookie: context.req.headers.cookie,
      }),
    },
  })

  if (!res.ok) {
    return {
      props: {
        error: await res.json(),
      },
    }
  }

  return {
    props: {
      fallback: {
        [generateKey('spaces', params)]: await res.json(),
      },
    },
  }
}

const Spaces = () => {
  const { data, error } = useQuery('spaces', '/api/spaces')

  return (
    <Layout>
      <Head>
        <title>Spaces</title>
      </Head>
      <h1 className="text-2xl font-bold text-gray-500 mb-4">Spaces</h1>
      {!!error && (
        <div className="mt-12">
          <ErrorInfo error={error} />
        </div>
      )}
      {!data && !error && (
        <div className="m-12">
          <LogoSpinner />
        </div>
      )}
      {!!data && !error && (
        <div className="grid grid-cols-4 gap-6">
          {data?.entities.map(({ id, name }) => (
            <Link key={id} href={`/spaces/${id}`} passHref>
              <div className="border-gray-300 border-2 rounded-3xl h-36 cursor-pointer">
                {name}
              </div>
            </Link>
          ))}
          <Link href="/spaces/create" passHref>
            <div className="border-dashed border-gray-400 text-gray-400 border-2 rounded-3xl h-36 flex items-center justify-center text-xl cursor-pointer hover:text-blue-500 hover:border-blue-500 transition-colors">
              <CgMathPlus />
            </div>
          </Link>
        </div>
      )}
    </Layout>
  )
}

export default withAuth(withFilters(Spaces, ['limit', 'page']))
