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
import { useFilters, withFilters } from 'shared/hooks/useFilters'
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
import { toast } from 'react-hot-toast'
import Modal from 'shared/components/Modal'
import {
  InputRangeFrame,
  PureInputRange,
} from 'shared/components/input/InputRange'

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

const QUERY_WINDOW = 30

const PluginList = withFilters(
  function InnerPluginList({ mapped, setMapped, setLayout }) {
    const { data } = useQuery('plugins', '/api/plugins')
    const [deleteModal, setDeleteModal] = useState<string | null>(null)
    const [infoModal, setInfoModal] = useState({ open: false, id: null })
    const [filters, setFilters] = useFilters()

    const handleLoadMore = () => {
      setFilters({
        limit: String(Number(filters.limit) + QUERY_WINDOW),
      })
    }

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

    const handleDeletePlugin = (pluginId: string) => () => {
      setDeleteModal(null)
      const plugin = mapped?.[pluginId]
      if (!plugin) return

      setMapped((mapped) => ({
        ...mapped,
        [pluginId]: null,
      }))
      setLayout((layout) => layout.filter(({ i }) => i !== pluginId))
    }

    return (
      <>
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
                <div key={plugin.id} className="flex items-center">
                  <div
                    className="flex items-center p-2 rounded-xl hover:bg-gray-200 flex-grow transition-colors cursor-pointer"
                    onClick={() => setInfoModal({ open: true, id: plugin.id })}
                  >
                    <img
                      src={plugin.icon}
                      className="w-10 h-10 rounded-25 mr-2"
                    />
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
                        onClick={() => setDeleteModal(plugin.id)}
                      >
                        <FiTrash2 />
                      </div>
                    </Tooltip>
                  )}
                </div>
              ))}
            {!!data?.pagination &&
              data.pagination.entityCount > data.pagination.limit && (
                <Button
                  color="light"
                  className="mx-auto mt-2"
                  onClick={handleLoadMore}
                >
                  Load more...
                </Button>
              )}
          </div>
        </div>
        <PluginInfoModal
          id={infoModal.id}
          open={infoModal.open}
          close={() => setInfoModal({ open: false, id: infoModal.id })}
          isAdded={!!infoModal?.id && !!mapped?.[infoModal.id]}
          handleAdd={handleAddPlugin}
          handleDelete={setDeleteModal}
        />
        <Modal visible={deleteModal != null} close={() => setDeleteModal(null)}>
          <div className="p-4">
            <h1 className="text-2xl font-bold text-red-500">Caution!</h1>
            <p>
              This operation is irreversible. If you submit the changes, this
              will permanently delete this plugin&apos;s data.
            </p>
            <div className="flex mt-6">
              <Button
                onClick={() => setDeleteModal(null)}
                className="ml-auto"
                color="light"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeletePlugin(deleteModal)}
                className="ml-2"
                color="red"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </>
    )
  },
  [],
  { name: '', limit: `${QUERY_WINDOW}` },
)

interface PluginInfoModalProps {
  id: string | null
  open: boolean
  close: () => void
  isAdded: boolean
  handleAdd: (plugin: PublishedPlugin) => () => void
  handleDelete: (id: string) => void
}

const PluginInfoModal = ({
  id,
  open,
  close,
  isAdded,
  handleAdd,
  handleDelete,
}: PluginInfoModalProps) => {
  const { data } = useQuery(!!id && ['plugins', id], `/api/plugins/${id}`)

  if (!data)
    return (
      <Modal visible={open} close={close} className="max-w-screen-sm w-full">
        <div className="m-12">
          <LogoSpinner />
        </div>
      </Modal>
    )

  const {
    name,
    author,
    description,
    icon,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
  } = data

  return (
    <Modal visible={open} close={close} className="max-w-screen-sm w-full">
      <div className="flex flex-col p-4">
        <div className="flex items-center">
          <img src={icon} className="w-16 h-16 rounded-25 mr-4" />
          <div className="flex-grow flex flex-col">
            <div className="font-bold text-2xl">{name}</div>
            <div className="text-gray-400">{author?.name}</div>
          </div>
          {isAdded ? (
            <Button color="red-link" onClick={() => handleDelete(data.id)}>
              Delete
            </Button>
          ) : (
            <Button color="blue-link" onClick={handleAdd(data)}>
              Add
            </Button>
          )}
        </div>
        <p className="mt-4">{description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <InputRangeFrame
            className="mt-2"
            label="Width"
            display={
              minWidth === maxWidth ? minWidth : `${minWidth} - ${maxWidth}`
            }
          >
            <PureInputRange
              values={[minWidth, maxWidth]}
              min={1}
              max={4}
              disabled={true}
            />
          </InputRangeFrame>
          <InputRangeFrame
            className="mt-2"
            label="Height"
            display={
              minHeight === maxHeight
                ? minHeight
                : `${minHeight} - ${maxHeight}`
            }
          >
            <PureInputRange
              values={[minHeight, maxHeight]}
              min={1}
              max={4}
              disabled={true}
            />
          </InputRangeFrame>
        </div>
      </div>
    </Modal>
  )
}
