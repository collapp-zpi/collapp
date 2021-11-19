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
import React from 'react'
import InviteButton from 'includes/invitations/InviteButton'
import { useRemoteComponent } from 'tools/useRemoteComponent'
import { BiErrorAlt } from 'react-icons/bi'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query
  const res = await fetch(`${process.env.BASE_URL}/api/spaces/${id}`, {
    method: 'GET',
    headers: {
      ...(context?.req?.headers?.cookie && {
        cookie: context.req.headers.cookie,
      }),
    },
  })

  const permissions = await fetch(
    `${process.env.BASE_URL}/api/spaces/${id}/permissions`,
    {
      method: 'GET',
      headers: {
        ...(context?.req?.headers?.cookie && {
          cookie: context.req.headers.cookie,
        }),
      },
    },
  )

  if (!res.ok) {
    return {
      props: {
        error: await res.json(),
      },
    }
  }

  if (!permissions.ok) {
    return {
      props: {
        error: await permissions.json(),
      },
    }
  }

  return {
    props: {
      fallback: {
        [generateKey('space', String(id))]: await res.json(),
        [generateKey('permissions', String(id))]: await permissions.json(),
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
}

interface PluginBlockItem extends PluginBlockSize {
  pluginId: string
}

const PluginBlock = ({
  spaceId,
  pluginId,
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
        <Component
          websockets={websocketsUrl}
          ids={{ plugin: pluginId, space: spaceId }}
          size={{
            top,
            left,
            width,
            height,
          }}
        />
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
