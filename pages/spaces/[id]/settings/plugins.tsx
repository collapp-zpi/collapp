import Head from 'next/head'
import { useRouter } from 'next/router'
import Button from 'shared/components/button/Button'
import { GoChevronLeft } from 'react-icons/go'
import { SpaceSettingsButtons } from 'includes/spaces/components/SpaceSettingsButtons'
import GridLayout, { WidthProvider } from 'react-grid-layout'
import styled from 'styled-components'
import {
  createContext,
  ReactNode,
  Ref,
  useContext,
  useEffect,
  useState,
} from 'react'
import { GetServerSidePropsContext } from 'next'
import { PublishedPlugin, SpacePlugin } from '@prisma/client'
import useRequest from 'shared/hooks/useRequest'
import { updateSpacePlugins } from 'includes/spaces/endpoints'
import { CgSpinner } from 'react-icons/cg'
import { toast } from 'react-hot-toast'
import PluginList from 'includes/spaces/plugin-editor/PluginList'
import { defaultPluginIcon } from 'config/defaultIcons'
import { withAuth } from 'shared/hooks/useAuth'
import { Layout } from 'layouts/Layout'
import { generateKey } from 'shared/utils/object'
import { useQuery } from 'shared/hooks/useQuery'
import { ErrorInfo } from 'shared/components/ErrorInfo'
import { LogoSpinner } from 'shared/components/LogoSpinner'
import { withFallback } from 'shared/hooks/useApiForm'

interface Plugin extends SpacePlugin {
  plugin: PublishedPlugin
}

const Tile = styled.div`
  background-color: #e0e0e0;
  border-radius: 1.75em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1em;
  font-weight: 600;

  &:hover .react-resizable-handle {
    opacity: 0.75;
  }
`

const TileImage = styled.img`
  width: 3em;
  height: 3em;
  border-radius: 0.6em;
`

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { id } = context.query
  const res = await fetch(`${process.env.BASE_URL}/api/plugins/space/${id}`, {
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
        [generateKey('space', String(id), 'plugins')]: await res.json(),
        [generateKey('permissions', String(id))]: await permissions.json(),
      },
    },
  }
}

export type MappedType = {
  [key: string]: { name: string; icon: string | null } | null
}

const PluginRepoContext = createContext<MappedType>({})

const usePluginData = (id: string) => useContext(PluginRepoContext)[id]

interface InnerResponsiveGridProps {
  width: number
  children: (size: number) => ReactNode
  innerRef: Ref<HTMLDivElement>
}

const InnerResponsiveGrid = ({
  width,
  innerRef,
  children,
}: InnerResponsiveGridProps) => {
  const [size, setSize] = useState(12)

  useEffect(() => {
    setSize(Math.ceil(width / 5.4 / 10) - 1)
  }, [width, setSize])

  return (
    <div ref={innerRef}>
      <div
        className="mx-auto"
        style={{ fontSize: 16 + (size - 16) * 0.5, width: size * 10 * 5.4 }}
      >
        {children(size)}
      </div>
    </div>
  )
}

const Grid = WidthProvider(InnerResponsiveGrid)

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
  const [mapped, setMapped] = useState(() => {
    const mapped: MappedType = {}

    for (const { pluginId, plugin } of plugins) {
      mapped[pluginId] = {
        name: plugin.name,
        icon: plugin.icon,
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
    }))
  })

  const router = useRouter()
  const id = String(router.query.id)

  const request = useRequest(updateSpacePlugins(id), {
    onSuccess: () => {
      toast.success('The plugins have been updated successfully.')
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
              <Grid>
                {(size) => (
                  <GridLayout
                    layout={layout}
                    cols={5}
                    margin={[size, size]}
                    rowHeight={size * 10}
                    width={size * 5.4 * 10}
                    onLayoutChange={(data) => setLayout(data)}
                    resizeHandles={['s', 'se', 'e']}
                  >
                    {layout.map(generateItem)}
                  </GridLayout>
                )}
              </Grid>
            </PluginRepoContext.Provider>
          </div>
        </div>
      </div>
    </>
  )
}

const generateItem = (data: LayoutType) => (
  <Tile key={data.i}>
    <Item id={data.i} />
  </Tile>
)

const Item = ({ id }: { id: string }) => {
  const data = usePluginData(id)

  return (
    <>
      <TileImage src={data?.icon ?? defaultPluginIcon} className="mb-2" />
      {data?.name}
    </>
  )
}
