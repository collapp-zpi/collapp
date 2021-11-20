import Head from 'next/head'
import { useRouter } from 'next/router'
import Button from 'shared/components/button/Button'
import { GoChevronLeft } from 'react-icons/go'
import { SpaceSettingsButtons } from 'includes/spaces/components/SpaceSettingsButtons'
import { useState } from 'react'
import { GetServerSidePropsContext } from 'next'
import { PublishedPlugin, SpacePlugin } from '@prisma/client'
import useRequest from 'shared/hooks/useRequest'
import { updateSpacePlugins } from 'includes/spaces/endpoints'
import { CgSpinner } from 'react-icons/cg'
import { toast } from 'react-hot-toast'
import PluginList from 'includes/spaces/plugin-editor/PluginList'
import { withAuth } from 'shared/hooks/useAuth'
import { Layout } from 'layouts/Layout'
import { generateKey } from 'shared/utils/object'
import { useQuery } from 'shared/hooks/useQuery'
import { ErrorInfo } from 'shared/components/ErrorInfo'
import { LogoSpinner } from 'shared/components/LogoSpinner'
import { withFallback } from 'shared/hooks/useApiForm'
import { useSWRConfig } from 'swr'
import {
  MappedType,
  PluginGrid,
  PluginRepoContext,
} from 'includes/spaces/plugin-editor/PluginGrid'
import { fetchApi } from 'shared/utils/fetchApi'

interface Plugin extends SpacePlugin {
  plugin: PublishedPlugin
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { id } = context.query
  const res = await fetchApi(`/api/plugins/space/${id}`)(context)
  const permissions = await fetchApi(`/api/spaces/${id}/permissions`)(context)

  return {
    props: {
      fallback: {
        [generateKey('space', String(id), 'plugins')]: res.ok
          ? await res.json()
          : undefined,
        [generateKey('permissions', String(id))]: permissions.ok
          ? await permissions.json()
          : undefined,
      },
    },
  }
}

export type LayoutType = {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  maxW?: number
  minH?: number
  maxH?: number
}

const SpacePluginSettings = () => {
  const router = useRouter()
  const id = String(router.query.id)

  const { data, error } = useQuery(
    ['space', id, 'plugins'],
    `/api/plugins/space/${id}`,
  )

  return (
    <Layout>
      <Head>
        <title>Space settings</title>
      </Head>
      {!data && (
        <div className="flex justify-between mb-4">
          <Button color="light" onClick={() => router.push(`/spaces/${id}`)}>
            <GoChevronLeft className="mr-2 -ml-2" />
            Back
          </Button>
        </div>
      )}
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
      {!!data && !error && <InnerPlugins plugins={data} />}
    </Layout>
  )
}

export default withAuth(withFallback(SpacePluginSettings))

const InnerPlugins = ({ plugins }: { plugins: Plugin[] }) => {
  const { mutate } = useSWRConfig()
  const [mapped, setMapped] = useState(() => {
    const mapped: MappedType = {}

    for (const { pluginId, plugin } of plugins) {
      mapped[pluginId] = {
        name: plugin.name,
        icon: plugin.icon,
        isDeleted: plugin.isDeleted,
      }
    }

    return mapped
  })

  const [layout, setLayout] = useState<LayoutType[]>(() => {
    return plugins.map(({ pluginId, width, height, left, top, plugin }) => ({
      i: pluginId,
      x: left,
      y: top,
      w: width,
      h: height,
      minW: plugin.minWidth,
      maxW: plugin.maxWidth,
      minH: plugin.minHeight,
      maxH: plugin.maxHeight,
      resizeHandles: [
        ...(plugin.minHeight !== plugin.maxHeight ? ['s'] : []),
        ...(plugin.minWidth !== plugin.maxWidth ? ['e'] : []),
        ...(plugin.minHeight !== plugin.maxHeight &&
        plugin.minWidth !== plugin.maxWidth
          ? ['se']
          : []),
      ],
    }))
  })

  const router = useRouter()
  const id = String(router.query.id)

  const request = useRequest(updateSpacePlugins(id), {
    onSuccess: () => {
      toast.success('The plugins have been updated successfully.')
      mutate(generateKey('space', id, 'plugins'))
    },
    onError: ({ message }) => {
      toast.error(
        `There has been an error while updating the plugins. ${
          !!message && `(${message})`
        }`,
      )
    },
  })

  const permissions = useQuery(
    ['permissions', id],
    `/api/spaces/${id}/permissions`,
  )

  const handleSubmit = () => {
    const newLayout = layout.map(({ i, x, y, w, h }) => ({
      id: i,
      left: x,
      top: y,
      width: w,
      height: h,
    }))
    return request.send(newLayout)
  }

  return (
    <>
      <div className="flex justify-between mb-4">
        <Button color="light" onClick={() => router.push(`/spaces/${id}`)}>
          <GoChevronLeft className="mr-2 -ml-2" />
          Back
        </Button>
        <Button
          color="blue"
          onClick={handleSubmit}
          disabled={request.isLoading}
        >
          {request.isLoading && (
            <CgSpinner className="animate-spin mr-2 -ml-2" />
          )}
          Submit
        </Button>
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-col md:mr-12">
          {!!permissions.data &&
          (permissions.data.canEdit || permissions.data.isOwner) ? (
            <SpaceSettingsButtons
              canEdit={permissions.data.canEdit}
              isOwner={permissions.data.isOwner}
            />
          ) : (
            <SpaceSettingsButtons canEdit={true} isOwner={false} />
          )}
          <PluginList {...{ mapped, setMapped, setLayout }} />
        </div>
        <div className="flex-grow mt-8 md:mt-0">
          <div
            className="bg-white px-1 py-2 rounded-3xl shadow-2xl relative"
            style={{ minHeight: '12.2rem' }}
          >
            {!layout?.length && (
              <div className="flex flex-col p-4 text-center items-center justify-center absolute w-full h-full left-0 top-0">
                <div className="font-bold text-2xl">There are no plugins</div>
                <div className="text-gray-400">
                  Add plugins from the list on the left-hand side
                </div>
              </div>
            )}
            <PluginRepoContext.Provider value={mapped}>
              <PluginGrid {...{ layout, setLayout }} />
            </PluginRepoContext.Provider>
          </div>
        </div>
      </div>
    </>
  )
}
