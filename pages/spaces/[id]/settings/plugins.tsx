import Head from 'next/head'
import { AuthLayout } from 'layouts/AuthLayout'
import { useRouter } from 'next/router'
import Button from 'shared/components/button/Button'
import { GoChevronLeft } from 'react-icons/go'
import { SpaceSettingsButtons } from 'includes/spaces/components/SpaceSettingsButtons'
import GridLayout, { WidthProvider } from 'react-grid-layout'
import styled from 'styled-components'
import { createContext, useContext, useEffect, useState } from 'react'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { PublishedPlugin, SpacePlugin } from '@prisma/client'
import { withFilters } from 'shared/hooks/useFilters'
import { useQuery } from 'shared/hooks/useQuery'
import { object, string } from 'yup'
import { AiOutlineSearch } from 'react-icons/ai'
import { InputText } from 'shared/components/input/InputText'
import { FiltersForm } from 'shared/components/form/FiltersForm'
import { LogoSpinner } from 'shared/components/LogoSpinner'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { Tooltip } from 'shared/components/Tooltip'
import useRequest from 'shared/hooks/useRequest'
import { updateSpacePlugins } from 'includes/spaces/endpoints'
import { CgSpinner } from 'react-icons/cg'

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

  if (!res.ok) {
    return {
      props: {
        error: await res.json(),
        isError: true,
      },
    }
  }

  const plugins: Plugin[] = await res.json()

  return {
    props: { plugins },
  }
}

interface PluginContext {
  [key: string]: { name: string; icon: string | null }
}

const PluginRepoContext = createContext<PluginContext>({})

const usePluginData = (id: string) => useContext(PluginRepoContext)[id]

const InnerResponsiveGrid = ({ width, innerRef, children }) => {
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

const SpacePluginSettings = ({
  plugins,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [mapped, setMapped] = useState(() => {
    const mapped: PluginContext = {}

    for (const { pluginId, plugin } of plugins) {
      mapped[pluginId] = {
        name: plugin.name,
        icon: plugin.icon,
      }
    }

    return mapped
  })

  const [layout, setLayout] = useState(() => {
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
  const pathId = String(router.query.id)
  const id = pathId

  const request = useRequest(updateSpacePlugins(pathId), {
    onSuccess: (data) => {
      console.log(data)
    },
    onError: () => {
      console.error('There has been an error')
    },
  })

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
    <AuthLayout>
      <Head>
        <title>Space settings</title>
      </Head>
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
          <SpaceSettingsButtons />
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
                  >
                    {layout.map(generateItem)}
                  </GridLayout>
                )}
              </Grid>
            </PluginRepoContext.Provider>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

export default SpacePluginSettings

const generateItem = (data) => (
  <Tile key={data.i}>
    <Item id={data.i} />
  </Tile>
)

const Item = ({ id }) => {
  const data = usePluginData(id)

  return (
    <>
      <TileImage src={data?.icon} className="mb-2" />
      {data?.name}
    </>
  )
}

const filtersSchema = object().shape({
  name: string().default(''),
})

const PluginList = withFilters(
  function InnerPluginList({ mapped, setMapped, setLayout }) {
    const { data } = useQuery('plugins', '/api/plugins')

    const handleAddPlugin = (plugin: PublishedPlugin) => () => {
      if (!!mapped?.[plugin.id]) return

      setMapped((mapped) => ({
        ...mapped,
        [plugin.id]: {
          name: plugin.name,
          icon: plugin.icon,
        },
      }))
      setLayout((layout) => [
        ...layout,
        {
          i: plugin.id,
          y: Infinity,
          x: 0,
          w: plugin.minWidth,
          h: plugin.minHeight,
        },
      ])
    }

    const handleDeletePlugin = (plugin: PublishedPlugin) => () => {
      if (!mapped?.[plugin.id]) return

      setMapped((mapped) => ({
        ...mapped,
        [plugin.id]: null,
      }))
      setLayout((layout) => layout.filter(({ i }) => i !== plugin.id))
    }

    return (
      <div className="bg-white p-4 rounded-3xl shadow-2xl mt-4 sticky top-4">
        <FiltersForm schema={filtersSchema}>
          <InputText icon={AiOutlineSearch} name="name" label="Plugin name" />
        </FiltersForm>
        <div className="mt-2">
          {!data && (
            <div className="text-center p-4 flex items-center justify-center">
              <LogoSpinner size="w-8 h-7" />
            </div>
          )}
          {!!data && !data?.entities?.length && (
            <div className="text-center mt-4 text-gray-400">
              No plugins found
            </div>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto flex flex-col">
          {!!data &&
            !!data?.entities?.length &&
            data.entities.map((plugin: PublishedPlugin) => (
              <div key={plugin.id} className="flex p-2 items-center">
                <img src={plugin.icon} className="w-10 h-10 rounded-25 mr-2" />
                <div className="flex flex-col w-100 flex-grow">
                  <div className="w-full h-4 mb-1 relative">
                    <div className="truncate font-bold whitespace-nowrap absolute w-full">
                      {plugin.name}
                    </div>
                  </div>
                  {!!plugin.description && (
                    <div className="w-full h-4 relative">
                      <div className="truncate text-xs text-gray-400 whitespace-nowrap absolute w-full">
                        {plugin.description}
                      </div>
                    </div>
                  )}
                </div>
                {!mapped?.[plugin.id] ? (
                  <Tooltip value="Add">
                    <div
                      className="p-2 ml-2 bg-blue-50 text-blue-400 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors rounded-xl"
                      onClick={handleAddPlugin(plugin)}
                    >
                      <FiPlus />
                    </div>
                  </Tooltip>
                ) : (
                  <Tooltip value="Delete">
                    <div
                      className="p-2 ml-2 bg-red-50 text-red-400 cursor-pointer hover:bg-red-500 hover:text-white transition-colors rounded-xl"
                      onClick={handleDeletePlugin(plugin)}
                    >
                      <FiTrash2 />
                    </div>
                  </Tooltip>
                )}
              </div>
            ))}
        </div>
      </div>
    )
  },
  [],
  { name: '', limit: '20' },
)
