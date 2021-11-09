import Head from 'next/head'
import { AuthLayout } from 'layouts/AuthLayout'
import { useRouter } from 'next/router'
import Button from 'shared/components/button/Button'
import { GoChevronLeft } from 'react-icons/go'
import { SpaceSettingsButtons } from 'includes/spaces/components/SpaceSettingsButtons'
import { Responsive, WidthProvider } from 'react-grid-layout'
import styled from 'styled-components'
import { createContext, useContext, useState } from 'react'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { SpacePlugin, PublishedPlugin } from '@prisma/client'

const SIZES = {
  xl: 15,
  md: 10,
  xs: 5,
}

interface Plugin extends SpacePlugin {
  plugin: PublishedPlugin
}

const Tile = styled.div`
  background-color: #e0e0e0;
  border-radius: 1.75em;
  min-width: 10em;
  min-height: 10em;
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

const Container = styled.div`
  width: 54em;
  margin: auto;
  font-size: 5px;
  @media (min-width: 768px) {
    font-size: 10px;
  }
  @media (min-width: 1280px) {
    font-size: 15px;
  }
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

const ResponsiveGridLayout = WidthProvider(Responsive)

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
  const [breakpoint, setBreakpoint] = useState('xs')

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
              <Container>
                <ResponsiveGridLayout
                  breakpoints={{ xl: 1280, md: 768, xs: 0 }}
                  cols={{ xl: 5, md: 5, xs: 5 }}
                  margin={{
                    xl: [SIZES.xl, SIZES.xl],
                    md: [SIZES.md, SIZES.md],
                    xs: [SIZES.xs, SIZES.xs],
                  }}
                  rowHeight={SIZES[breakpoint] * 10}
                  layouts={{
                    xl: layout,
                    md: layout,
                    xs: layout,
                  }}
                  onLayoutChange={(data) => setLayout(data)}
                  onBreakpointChange={(b) => setBreakpoint(b)}
                >
                  {layout.map(generateItem)}
                </ResponsiveGridLayout>
              </Container>
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
