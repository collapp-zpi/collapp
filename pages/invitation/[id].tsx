import { AuthLayout } from 'layouts/AuthLayout'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { RedirectableProviderType } from 'next-auth/providers'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { AiOutlineMail } from 'react-icons/ai'
import { BsGoogle } from 'react-icons/bs'
import { MdAlternateEmail } from 'react-icons/md'
import Button from 'shared/components/button/Button'
import SubmitButton from 'shared/components/button/SubmitButton'
import { UncontrolledForm } from 'shared/components/form/UncontrolledForm'
import { InputText } from 'shared/components/input/InputText'
import { LogoSpinner } from 'shared/components/LogoSpinner'
import request from 'shared/utils/request'
import { object, string } from 'yup'

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

  const isError = !res.ok

  if (isError) {
    return { props: { error: await res.json(), isError } }
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
  const [emailSent, setEmailSent] = useState(false)

  if (status === 'loading') {
    return (
      <div className="flex justify-center align-middle h-full min-h-screen">
        <LogoSpinner />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    const schema = object().shape({
      email: string().email().required(),
    })

    const onError = () => {
      toast.error('Email was not send.')
    }

    const onSuccess = () => {
      setEmailSent(true)
      toast.success('Email was sent')
    }

    const query = async ({ email }: { email: string }) => {
      const response = await signIn<RedirectableProviderType>('email', {
        redirect: false,
        email,
      })
      if (!response || response.error) throw new Error('Login error')
    }

    return (
      <div>
        {emailSent ? (
          <div className="flex items-center justify-center space-x-2 pb-4">
            <AiOutlineMail />
            <h2>Check your email inbox</h2>
          </div>
        ) : (
          <div>
            <Button
              className="mx-auto"
              onClick={() =>
                signIn('google', {
                  redirect: true,
                })
              }
            >
              <BsGoogle className="-ml-2 mr-2" /> Sign with Google
            </Button>
            <div className="flex items-center">
              <div className="flex-1 w-0.5 h-0.5 rounded-full mx-4 bg-gray-200" />
              <p>OR</p>
              <div className="flex-1 w-0.5 h-0.5 rounded-full mx-4 bg-gray-200" />
            </div>
            <UncontrolledForm
              {...{ schema, query, onSuccess, onError }}
              className="flex"
            >
              <InputText
                type="email"
                name="email"
                label="Email"
                icon={MdAlternateEmail}
              />
              <SubmitButton className="h-12" />
            </UncontrolledForm>
          </div>
        )}
      </div>
    )
  }

  if (status === 'authenticated') {
    const handleAccept = async () => {
      const response = await request.post(`/api/invitation/${pathId}`)
      toast.success('You were added to the space')
      router.push(`/spaces/${props.invitation.spaceId}`)
    }

    if (props.isError) {
      return <AuthLayout>{props.error.message}</AuthLayout>
    }

    return (
      <AuthLayout>
        <Button onClick={handleAccept}>Accept</Button>
        <Button color="red" onClick={() => router.push('/')}>
          Decline
        </Button>
      </AuthLayout>
    )
  }
}

export default Invitation
