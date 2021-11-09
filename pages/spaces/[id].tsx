import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Head from 'next/head'
import { AuthLayout } from 'layouts/AuthLayout'
import { useRouter } from 'next/router'
import Button from 'shared/components/button/Button'
import { GoChevronLeft } from 'react-icons/go'
import { generateKey } from 'shared/utils/object'
import { useQuery } from 'shared/hooks/useQuery'
import { Loading } from 'layouts/Loading'
import { withFallback } from 'shared/hooks/useApiForm'
import styled from 'styled-components'
import { ReactNode } from 'react'

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

  if (!res.ok) {
    return {
      props: {
        error: await res.json(),
        isError: true,
      },
    }
  }

  return {
    props: {
      fallback: {
        [generateKey('space', String(id))]: await res.json(),
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
  children: ReactNode
}

interface PluginBlockItem extends PluginBlockSize {
  pluginId: string
}

const PluginBlock = ({
  children,
  top,
  left,
  width,
  height,
}: PluginBlockProps) => (
  <div
    className="bg-white rounded-3xl shadow-2xl overflow-hidden"
    style={{
      borderRadius: 35,
      gridColumnStart: left + 1,
      gridColumnEnd: `span ${width}`,
      gridRowStart: top + 1,
      gridRowEnd: `span ${height}`,
    }}
  >
    {children}
  </div>
)

const Space = ({
  props,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const pathId = String(router.query.id)
  const { data } = useQuery(['space', pathId], `/api/spaces/${pathId}`)

  console.log(data)

  const { name, description, plugins } = data || {}

  if (props?.isError) {
    return <div>error hello</div>
  }

  if (!data) {
    return (
      <AuthLayout>
        <Loading />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Head>
        <title>Space</title>
      </Head>
      <Button
        color="light"
        onClick={() => router.push('/spaces')}
        className="mb-4"
      >
        <GoChevronLeft className="mr-2 -ml-2" />
        Back
      </Button>
      <h1>{name}</h1>
      <p>{description}</p>
      <div className="flex mt-4">
        <PluginGrid>
          {plugins.map(({ pluginId, ...size }: PluginBlockItem) => (
            <PluginBlock key={pluginId} {...size}>
              {pluginId}
            </PluginBlock>
          ))}
        </PluginGrid>
      </div>
    </AuthLayout>
  )
}

export default withFallback(Space)
