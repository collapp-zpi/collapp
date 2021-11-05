import Head from 'next/head'
import { AuthLayout } from 'layouts/AuthLayout'
import { toast } from 'react-hot-toast'
import { object, string } from 'yup'
import { InputPhoto } from 'shared/components/input/InputPhoto'
import { InputText } from 'shared/components/input/InputText'
import { BiText } from 'react-icons/bi'
import SubmitButton from 'shared/components/button/SubmitButton'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { updateUser } from 'includes/user/endpoints'
import { useSWRConfig } from 'swr'
import useApiForm, { withFallback } from 'shared/hooks/useApiForm'
import Form from 'shared/components/form/Form'
import { generateKey } from 'shared/utils/object'
import { useQuery } from 'shared/hooks/useQuery'
import { Loading } from 'layouts/Loading'

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
        isError: true,
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

const UserSettings = ({
  props,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data } = useQuery('user', `/api/user`)

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

  const { name, image } = data

  return (
    <AuthLayout>
      <Head>
        <title>Settings</title>
      </Head>
      <div className="bg-white px-8 py-8 rounded-3xl shadow-2xl">
        <h1 className="text-2xl font-bold text-gray-500 mb-4">User settings</h1>
        <UserForm {...{ name, image }} />
      </div>
    </AuthLayout>
  )
}

export default withFallback(UserSettings)

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
