import Head from 'next/head'
import { AuthLayout } from 'layouts/AuthLayout'
import { useRouter } from 'next/router'
import Button from 'shared/components/button/Button'
import { GoChevronLeft } from 'react-icons/go'
import { SpaceSettingsButtons } from 'includes/spaces/components/SpaceSettingsButtons'
import ReactGridLayout from 'react-grid-layout'
import styled from 'styled-components'
import { useState } from 'react'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { SpacePlugin, PublishedPlugin } from '@prisma/client'

const BASE = 15

interface Plugin extends SpacePlugin {
  plugin: PublishedPlugin
}

const Tile = styled.div`
  background-color: #e0e0e0;
  border-radius: ${BASE * 10 * 0.175}px;
  min-width: ${BASE * 10}px;
  min-height: ${BASE * 10}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1em;
  font-weight: 600;

  > div {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #c5c5c5;
    margin-bottom: 6px;
  }
`

const Container = styled.main`
  width: ${BASE * 5.4 * 10}px;
  margin: auto;
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

// interface PluginContext {
//   [key: string]: { name: string; icon: string | null }
// }
//
// const PluginRepoContext = createContext<PluginContext>({})

const SpacePluginSettings = ({
  plugins,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  // const [mapped, setMapped] = useState(() => {
  //   const mapped: PluginContext = {}
  //
  //   for (const { pluginId, plugin } of plugins) {
  //     mapped[pluginId] = {
  //       name: plugin.name,
  //       icon: plugin.icon,
  //     }
  //   }
  //
  //   return mapped
  // })

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
      <div className="flex">
        <div className="flex flex-col mr-12">
          <SpaceSettingsButtons />
        </div>
        <div className="flex-grow">
          <div className="bg-white px-8 py-8 rounded-3xl shadow-2xl">
            <Container>
              <ReactGridLayout
                width={BASE * 5.4 * 10}
                cols={5}
                margin={[BASE, BASE]}
                rowHeight={BASE * 10}
                layout={layout}
                onLayoutChange={(data) => setLayout(data)}
              >
                {layout.map(generateItem)}
              </ReactGridLayout>
            </Container>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

export default SpacePluginSettings

const generateItem = (data) => (
  <Tile key={data.i}>
    <div />
    {data.i}
  </Tile>
)
