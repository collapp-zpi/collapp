import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Button from 'shared/components/button/Button'
import { GoChevronLeft } from 'react-icons/go'
import { generateKey } from 'shared/utils/object'
import { useQuery } from 'shared/hooks/useQuery'
import { withFallback } from 'shared/hooks/useApiForm'
import styled from 'styled-components'
import { FiSettings } from 'react-icons/fi'
import { ErrorInfo } from 'shared/components/ErrorInfo'
import { LogoSpinner } from 'shared/components/LogoSpinner'
import { Layout } from 'layouts/Layout'
import { withAuth } from 'shared/hooks/useAuth'
import { CgSpinner } from 'react-icons/cg'
import { Tooltip } from 'shared/components/Tooltip'
import React, { useMemo } from 'react'
import InviteButton from 'includes/invitations/InviteButton'
import { useRemoteComponent } from 'tools/useRemoteComponent'
import { BiErrorAlt } from 'react-icons/bi'
import { fetchApi } from 'shared/utils/fetchApi'
import { useSession } from 'next-auth/react'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query

  const res = await fetchApi(`/api/spaces/${id}`)(context)
  const permissions = await fetchApi(`/api/spaces/${id}/permissions`)(context)
  const users = await fetchApi(`/api/spaces/${id}/users`)(context)

  return {
    props: {
      fallback: {
        [generateKey('space', String(id), 'users')]: users.ok
          ? await users.json()
          : undefined,
        [generateKey('space', String(id))]: res.ok
          ? await res.json()
          : undefined,
        [generateKey('permissions', String(id))]: permissions.ok
          ? await permissions.json()
          : undefined,
      },
    },
  }
}

const PluginGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 200px);
  grid-auto-rows: 200px;
  gap: 20px;
  margin: auto;
`

interface PluginBlockSize {
  top: number
  left: number
  width: number
  height: number
}

interface PluginBlockProps extends PluginBlockSize {
  pluginId: string
  spaceId: string
  userId: string
  users: { [key: string]: SimpleUserItem }
}

interface PluginBlockItem extends PluginBlockSize {
  pluginId: string
}

interface SimpleUserItem {
  name: string
  image: string
}

const PluginBlock = ({
  spaceId,
  pluginId,
  userId,
  users,
  top,
  left,
  width,
  height,
}: PluginBlockProps) => {
  const spacePluginId = `${spaceId}_${pluginId}`
  const componentUrl = `https://cloudfront.collapp.live/plugins/${pluginId}/entry.js`
  const websocketsUrl = `wss://collapp-build-server.herokuapp.com`
  const [loading, err, Component] = useRemoteComponent(componentUrl)

  return (
    <div
      className="rounded-3xl shadow-2xl overflow-hidden bg-gray-300 flex"
      style={{
        borderRadius: 35,
        gridColumnStart: left + 1,
        gridColumnEnd: `span ${width}`,
        gridRowStart: top + 1,
        gridRowEnd: `span ${height}`,
      }}
    >
      {loading && (
        <Tooltip value={spacePluginId} className="m-auto" innerClassName="p-2">
          <CgSpinner className="animate-spin text-gray-500 text-xl" />
        </Tooltip>
      )}
      {err && (
        <Tooltip
          value={`Somethig is wrong with plugin ${spacePluginId}`}
          className="m-auto"
          innerClassName="p-2"
        >
          <div className="w-full h-full m-auto flex justify-center justify-items-center">
            <BiErrorAlt className="w-32 h-32 m-auto text-red-500" />
          </div>
        </Tooltip>
      )}
      {!loading && !err && (
        <div className={pluginId}>
          <Component
            websockets={websocketsUrl}
            ids={{ plugin: pluginId, space: spaceId, user: userId }}
            users={users}
            size={{
              top,
              left,
              width,
              height,
            }}
          />
        </div>
      )}
    </div>
  )
}

const Space = () => {
  const router = useRouter()
  const pathId = String(router.query.id)
  const { data, error } = useQuery(['space', pathId], `/api/spaces/${pathId}`)
  const permissions = useQuery(
    ['permissions', pathId],
    `/api/spaces/${pathId}/permissions`,
  )
  const session = useSession()
  const usersQuery = useQuery(
    ['space', pathId, 'users'],
    `/api/spaces/${pathId}/users`,
  )
  const users = useMemo(() => {
    const users: { [key: string]: SimpleUserItem } = {}
    for (const { user } of usersQuery.data || []) {
      users[user.id] = {
        name: user.name,
        image: user.image,
      }
    }
    return users
  }, [usersQuery.data])

  const { id, name, description, plugins } = data || {}

  return (
    <Layout>
      <Head>
        <title>Space</title>
      </Head>
      <div className="flex justify-between">
        <Button
          color="light"
          onClick={() => router.push('/spaces')}
          className="mb-4"
        >
          <GoChevronLeft className="mr-2 -ml-2" />
          Back
        </Button>
        <div className="flex space-x-4">
          {!!permissions.data && permissions.data.canInvite && (
            <InviteButton spaceId={pathId} />
          )}

          <Button
            color="light"
            onClick={() => router.push(`/spaces/${id}/settings`)}
            className="mb-4"
          >
            <FiSettings className="mr-2 -ml-2" />
            Settings
          </Button>
        </div>
      </div>
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
        <>
          <h1 className="text-2xl font-bold">{name}</h1>
          <p className="whitespace-pre-wrap">{description}</p>
          <div className="flex mt-12">
            <PluginGrid>
              {plugins.map(({ pluginId, ...size }: PluginBlockItem) => (
                <PluginBlock
                  key={pluginId}
                  pluginId={pluginId}
                  spaceId={pathId}
                  userId={(session?.data?.userId as string) ?? ''}
                  users={users}
                  {...size}
                />
              ))}
            </PluginGrid>
          </div>
        </>
      )}
    </Layout>
  )
}

export default withAuth(withFallback(Space))
