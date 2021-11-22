import Head from 'next/head'
import { withFilters } from 'shared/hooks/useFilters'
import { useQuery } from 'shared/hooks/useQuery'
import { LogoSpinner } from 'shared/components/LogoSpinner'
import { CgMathPlus } from 'react-icons/cg'
import Link from 'next/link'
import { Layout } from 'layouts/Layout'
import { withAuth } from 'shared/hooks/useAuth'
import { ErrorInfo } from 'shared/components/ErrorInfo'
import { Tooltip } from 'shared/components/Tooltip'
import { defaultSpaceIcon, defaultUserIcon } from 'shared/utils/defaultIcons'

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
          <Tooltip value="Create a new space" innerClassName="">
            <Link href="/spaces/create" passHref>
              <div className="border-dashed border-gray-400 text-gray-400 border-2 rounded-3xl h-40 flex items-center justify-center text-xl cursor-pointer hover:text-blue-500 hover:border-blue-500 transition-colors">
                <CgMathPlus />
              </div>
            </Link>
          </Tooltip>
          {data?.entities.map(({ id, name, icon, users }) => (
            <Link key={id} href={`/spaces/${id}`} passHref>
              <div className="border-gray-300 rounded-3xl h-40 cursor-pointer bg-gray-50 shadow-xl p-6 flex flex-col transform hover:-translate-y-2 hover:shadow-2xl transition-all">
                <div className="flex justify-between items-center">
                  <img
                    src={icon || defaultSpaceIcon}
                    alt="Space icon"
                    className="w-10 h-10 rounded-lg bg-gray-200 shadow-lg"
                  />
                  <div className="flex -space-x-2.5">
                    {users.map(({ user }) => (
                      <Tooltip
                        value={user.name}
                        key={user.id}
                        innerClassName="flex transform hover:-translate-y-1 hover:shadow-sm shadow-none transition-all"
                      >
                        <img
                          src={user?.image || defaultUserIcon}
                          alt="User image"
                          className="w-9 h-9 rounded-full bg-gray-200 border-2 border-gray-50"
                        />
                      </Tooltip>
                    ))}
                  </div>
                </div>
                <div className="mt-auto font-bold text-lg h-6 truncate">
                  {name}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  )
}

export default withAuth(withFilters(Spaces, ['limit', 'page']))
