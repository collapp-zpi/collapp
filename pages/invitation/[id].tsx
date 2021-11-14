import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React from 'react'
import toast from 'react-hot-toast'
import Button from 'shared/components/button/Button'
import { LogoSpinner } from 'shared/components/LogoSpinner'
import request from 'shared/utils/request'
import { LoginForm } from 'includes/user/LoginForm'
import { Layout } from 'layouts/Layout'
import { withAuth } from 'shared/hooks/useAuth'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query
  const res = await fetch(`${process.env.BASE_URL}/api/invitation/${id}`, {
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
      invitation: await res.json(),
    },
  }
}

const Invitation = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const { status } = useSession()
  const router = useRouter()
  const pathId = String(router.query.id)

  if (status === 'loading') {
    return (
      <div className="flex justify-center align-middle h-full min-h-screen">
        <LogoSpinner />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div>
        <LoginForm />
      </div>
    )
  }

  const handleAccept = async () => {
    await request.post(`/api/invitation/${pathId}`)
    toast.success('You were added to the space')
    router.push(`/spaces/${props.invitation.spaceId}`)
  }

  if (props.isError) {
    return <Layout>{props.error.message}</Layout>
  }

  return (
    <Layout>
      <Button onClick={handleAccept}>Accept</Button>
      <Button color="red" onClick={() => router.push('/')}>
        Decline
      </Button>
    </Layout>
  )
}

export default withAuth(Invitation)
