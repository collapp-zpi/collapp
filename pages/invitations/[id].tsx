import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import Button from 'shared/components/button/Button'
import { LogoSpinner } from 'shared/components/LogoSpinner'
import request from 'shared/utils/request'
import { LoginForm } from 'includes/user/LoginForm'
import { Layout } from 'layouts/Layout'
import { defaultPluginIcon } from 'shared/utils/defaultIcons'
import { truncate } from 'shared/utils/text'
import useRequest from 'shared/hooks/useRequest'
import { CgSpinner } from 'react-icons/cg'
import { FiCheck } from 'react-icons/fi'
import { useQuery } from 'shared/hooks/useQuery'
import { ErrorInfo } from 'shared/components/ErrorInfo'

const Invitation = () => {
  const { status } = useSession()

  if (status === 'loading') {
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

  return <InnerInvitation />
}

export default Invitation

const InnerInvitation = () => {
  const router = useRouter()
  const id = String(router.query.id)
  const { data, error } = useQuery(
    ['invitations', id],
    `/api/invitations/${id}`,
  )

  const invitationRequest = useRequest(
    () => request.post(`/api/invitations/${id}`),
    {
      onSuccess: () => {
        toast.success('You have successfully joined the space')
        router.push(`/spaces/${data.spaceId}`)
      },
      onError: () => {
        toast.success('An error occurred while joining the space')
      },
    },
  )

  console.log({ ...error })

  useEffect(() => {
    if (!error) return

    setTimeout(() => toast.error(error?.data?.message ?? error?.message), 0)
    router.push(`/spaces`)
  }, [error, router])

  return (
    <Layout>
      {!!error ? (
        <div className="mt-12">
          <ErrorInfo error={error} />
        </div>
      ) : !data ? (
        <div className="m-auto p-12">
          <LogoSpinner />
        </div>
      ) : (
        <>
          <h3 className="text-lg text-center mt-16">
            You have been invited to
          </h3>

          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg mx-auto mt-8">
            <img
              src={data.space.icon || defaultPluginIcon}
              alt="Plugin icon"
              className="rounded-25 w-16 h-16 shadow-xl mx-auto"
            />
            <h3 className="text-3xl text-center font-bold mt-2">
              {data.space.name}
            </h3>
            {!!data.space?.description && (
              <p className="text-center mt-2">
                {truncate(data.space.description)}
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
        </>
      )}
    </Layout>
  )
}
