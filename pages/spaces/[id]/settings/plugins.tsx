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

  return (
    <AuthLayout>
      <Head>
        <title>Space settings</title>
      </Head>
      <Button
        color="light"
        onClick={() => router.push(`/spaces/${id}`)}
        className="mb-4"
      >
        <GoChevronLeft className="mr-2 -ml-2" />
        Back
      </Button>
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-col mr-12">
          <SpaceSettingsButtons />
        </div>
        <div className="flex-grow mt-8 md:mt-0">
          <div className="bg-white px-8 py-8 rounded-3xl shadow-2xl">
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
