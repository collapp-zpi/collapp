import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useLayoutEffect } from 'react'
import toast from 'react-hot-toast'
import Button from 'shared/components/button/Button'
import { LogoSpinner } from 'shared/components/LogoSpinner'
import request from 'shared/utils/request'
import { LoginForm } from 'includes/user/LoginForm'
import { Layout } from 'layouts/Layout'
import { defaultPluginIcon } from 'config/defaultIcons'
import { truncate } from 'shared/utils/text'
import useRequest from 'shared/hooks/useRequest'
import { CgSpinner } from 'react-icons/cg'
import { FiCheck } from 'react-icons/fi'

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
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
      },
    }
  }

  return {
    props: {
      invitation: await res.json(),
    },
  }
}

const Invitation = ({
  error,
  invitation,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { status } = useSession()
  const router = useRouter()
  const pathId = String(router.query.id)

  const invitationRequest = useRequest(
    () => request.post(`/api/invitation/${pathId}`),
    {
      onSuccess: () => {
        toast.success('You have successfully joined the space')
        router.push(`/spaces/${invitation.spaceId}`)
      },
      onError: () => {
        toast.success('An error occurred while joining the space')
      },
    },
  )

  useLayoutEffect(() => {
    if (!error) return

    setTimeout(() => toast.error(error.message), 0)
    router.push(`/spaces`)
  }, [error, router])

  if (status === 'loading' || error) {
    return (
      <div className="flex justify-center align-middle h-full min-h-screen">
        <LogoSpinner />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Layout>
        <h1 className="text-4xl font-bold text-center mt-16">
          Welcome to Collapp!
        </h1>
        <h3 className="text-xl text-center">Please login to continue</h3>
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md mx-auto mt-16">
          <LoginForm />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <h3 className="text-lg text-center mt-16">You have been invited to</h3>

      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg mx-auto mt-8">
        <img
          src={invitation.space.icon || defaultPluginIcon}
          className="rounded-25 w-16 h-16 shadow-xl mx-auto"
        />
        <h3 className="text-3xl text-center font-bold mt-2">
          {invitation.space.name}
        </h3>
        {!!invitation.space?.description && (
          <p className="text-center mt-2">
            {truncate(invitation.space.description)}
          </p>
        )}
      </div>

      <div className="mt-8 max-w-lg mx-auto flex justify-end">
        <Button color="light" onClick={() => router.push('/spaces')}>
          Ignore
        </Button>
        <Button onClick={invitationRequest.send} className="ml-2">
          {invitationRequest.isLoading ? (
            <CgSpinner className="animate-spin mr-2 -ml-2" />
          ) : (
            <FiCheck strokeWidth={4} className="mr-2 -ml-2" />
          )}
          Accept
        </Button>
      </div>
    </Layout>
  )
}

export default Invitation
