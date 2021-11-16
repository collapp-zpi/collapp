import Head from 'next/head'
import { toast } from 'react-hot-toast'
import { object, string } from 'yup'
import { InputPhoto } from 'shared/components/input/InputPhoto'
import { InputText } from 'shared/components/input/InputText'
import { BiText } from 'react-icons/bi'
import SubmitButton from 'shared/components/button/SubmitButton'
import { GetServerSideProps } from 'next'
import { updateUser } from 'includes/user/endpoints'
import { useSWRConfig } from 'swr'
import useApiForm, { withFallback } from 'shared/hooks/useApiForm'
import Form from 'shared/components/form/Form'
import { generateKey } from 'shared/utils/object'
import { useQuery } from 'shared/hooks/useQuery'
import { ErrorInfo } from 'shared/components/ErrorInfo'
import { LogoSpinner } from 'shared/components/LogoSpinner'
import { Layout } from 'layouts/Layout'
import { withAuth } from 'shared/hooks/useAuth'
import React from 'react'
import { AccountDeleteForm } from 'includes/user/AccountDeleteForm'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const res = await fetch(`${process.env.BASE_URL}/api/user`, {
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
      fallback: {
        [generateKey('user')]: await res.json(),
      },
    },
  }
}

const schema = object().shape({
  name: string().required().default(''),
  image: string(),
})

const UserSettings = () => {
  const { data, error } = useQuery('user', `/api/user`)
  const { name, image } = data

  return (
    <Layout>
      <Head>
        <title>Settings</title>
      </Head>
      {!!error && (
        <div className="mt-6">
          <ErrorInfo error={error} />
        </div>
      )}
      {!data && !error && (
        <div className="m-12">
          <LogoSpinner />
        </div>
      )}
      {!!data && !error && (
        <div>
          <div className="bg-white px-8 py-8 rounded-3xl shadow-2xl">
            <h1 className="text-2xl font-bold text-gray-500 mb-4">
              User settings
            </h1>
            <UserForm {...{ name, image }} />
          </div>
          <div className="bg-white px-8 py-8 mt-12 rounded-3xl shadow-2xl">
            <AccountDeleteForm />
          </div>
        </div>
      )}
    </Layout>
  )
}

export default withAuth(withFallback(UserSettings))

interface UserFormProps {
  name: string
  image: string
}

const UserForm = ({ name, image }: UserFormProps) => {
  const { mutate } = useSWRConfig()
  const apiForm = useApiForm({
    query: updateUser,
    initial: { name, image: undefined },
    schema,
    onSuccess: (_, methods) => {
      toast.success('Your profile has been updated successfully.')
      mutate('user').then(({ name }) => {
        methods.reset({ name })
      })
    },
    onError: ({ message }) => {
      toast.error(
        `There has been an error while updating your profile. ${
          !!message && `(${message})`
        }`,
      )
    },
  })

  return (
    <Form {...apiForm} className="flex flex-col">
      <div className="flex flex-col md:flex-row">
        <InputPhoto name="image" image={image} />
        <div className="flex-grow flex flex-col">
          <InputText
            name="name"
            label="Name"
            icon={BiText}
            className="mt-2 md:mt-0"
          />
        </div>
      </div>
      <SubmitButton className="ml-auto mt-4" />
    </Form>
  )
}
