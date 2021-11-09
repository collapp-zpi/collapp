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

const Space = ({
  props,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const pathId = String(router.query.id)
  const { data } = useQuery(['space', pathId], `/api/spaces/${pathId}`)

  const { name, description, icon } = data || {}

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
    </AuthLayout>
  )
}

export default withFallback(Space)
