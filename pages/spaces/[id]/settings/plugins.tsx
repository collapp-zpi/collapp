import Head from 'next/head'
import { AuthLayout } from 'layouts/AuthLayout'
import { useRouter } from 'next/router'
import Button from 'shared/components/button/Button'
import { GoChevronLeft } from 'react-icons/go'
import { SpaceSettingsButtons } from 'includes/spaces/components/SpaceSettingsButtons'
import ReactGridLayout from 'react-grid-layout'
import styled from 'styled-components'
import { useState } from 'react'

const BASE = 15

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

const INITIAL_DATA = [
  {
    i: 'To-do list',
    x: 0,
    y: 0,
    w: 2,
    h: 3,
  },
  {
    i: 'Calendar',
    x: 2,
    y: 0,
    w: 1,
    h: 1,
    maxW: 1,
    maxH: 1,
  },
  {
    i: 'Weather',
    x: 3,
    y: 0,
    w: 2,
    h: 1,
  },
  {
    i: 'Agenda',
    x: 2,
    y: 1,
    w: 3,
    h: 2,
  },
  {
    i: 'Chat',
    x: 0,
    y: 3,
    w: 4,
    h: 3,
  },
  {
    i: 'Quick link',
    x: 4,
    y: 3,
    w: 1,
    h: 1,
  },
  {
    i: 'Photo a day',
    x: 4,
    y: 4,
    w: 1,
    h: 2,
  },
]

const SpacePluginSettings = () => {
  const [layout, setLayout] = useState(INITIAL_DATA)
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

const generateItem = (data) => {
  return (
    <Tile data-grid={data} key={data.i}>
      <div />
      {data.i}
    </Tile>
  )
}
