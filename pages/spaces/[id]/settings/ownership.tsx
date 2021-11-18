import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Button from 'shared/components/button/Button'
import { GoChevronLeft } from 'react-icons/go'
import { generateKey } from 'shared/utils/object'
import { useQuery } from 'shared/hooks/useQuery'
import useApiForm, { withFallback } from 'shared/hooks/useApiForm'
import { useSWRConfig } from 'swr'
import { toast } from 'react-hot-toast'
import Form from 'shared/components/form/Form'
import { InputPhoto } from 'shared/components/input/InputPhoto'
import { InputText } from 'shared/components/input/InputText'
import { BiText } from 'react-icons/bi'
import SubmitButton from 'shared/components/button/SubmitButton'
import { object, string } from 'yup'
import { updateSpace } from 'includes/spaces/endpoints'
import { InputTextarea } from 'shared/components/input/InputTextarea'
import { FiAlignCenter } from 'react-icons/fi'
import { SpaceSettingsButtons } from 'includes/spaces/components/SpaceSettingsButtons'
import { withAuth } from 'shared/hooks/useAuth'
import { Layout } from 'layouts/Layout'
import { ErrorInfo } from 'shared/components/ErrorInfo'
import { LogoSpinner } from 'shared/components/LogoSpinner'
import { defaultSpaceIcon } from 'shared/utils/defaultIcons'

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

  const permissions = await fetch(
    `${process.env.BASE_URL}/api/spaces/${id}/permissions`,
    {
      method: 'GET',
      headers: {
        ...(context?.req?.headers?.cookie && {
          cookie: context.req.headers.cookie,
        }),
      },
    },
  )

  if (!res.ok) {
    return {
      props: {
        error: await res.json(),
      },
    }
  }

  if (!permissions.ok) {
    return {
      props: {
        error: await permissions.json(),
      },
    }
  }

  return {
    props: {
      fallback: {
        [generateKey('space', String(id))]: await res.json(),
        [generateKey('permissions', String(id))]: await permissions.json(),
      },
    },
  }
}

const SpaceSettings = () => {
  const router = useRouter()
  const pathId = String(router.query.id)
  const { data, error } = useQuery(['space', pathId], `/api/spaces/${pathId}`)
  const permissions = useQuery(
    ['permissions', pathId],
    `/api/spaces/${pathId}/permissions`,
  )

  const { id, name, description, icon } = data || {}

  return (
    <Layout>
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
      {!!error && (
        <div className="mt-12">
          <ErrorInfo error={error} />
        </div>
      )}
      {!data && !error && (
        <div className="m-12">
          <LogoSpinner />
        </div>
      )}
      {!!data && !error && (
        <div className="flex">
          <div className="flex flex-col mr-12">
            {!!permissions.data &&
            (permissions.data.canEdit || permissions.data.isOwner) ? (
              <SpaceSettingsButtons
                canEdit={permissions.data.canEdit}
                isOwner={permissions.data.isOwner}
              />
            ) : (
              <SpaceSettingsButtons canEdit={false} isOwner={false} />
            )}
          </div>
          <div className="flex-grow">
            <div className="bg-white px-8 py-8 rounded-3xl shadow-2xl">
              {!!permissions.data &&
              (permissions.data.canEdit || permissions.data.isOwner) ? (
                <SpaceForm disabled={false} {...{ name, description, icon }} />
              ) : (
                <SpaceForm disabled={true} {...{ name, description, icon }} />
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default withAuth(withFallback(SpaceSettings))

interface SpaceFormProps {
  name: string
  description: string
  icon: string
  disabled: boolean
}

const schema = object().shape({
  name: string().required().default(''),
  description: string().default(''),
  icon: string(),
})

const SpaceForm = ({ name, description, icon, disabled }: SpaceFormProps) => {
  const router = useRouter()
  const pathId = String(router.query.id)
  const { mutate } = useSWRConfig()

  const apiForm = useApiForm({
    query: updateSpace(pathId),
    initial: { name, description, icon: undefined },
    schema,
    onSuccess: (_, methods) => {
      toast.success('The space has been updated successfully.')
      mutate(generateKey('space', pathId)).then(({ name }) => {
        methods.reset({ name })
      })
    },
    onError: ({ message }) => {
      toast.error(
        `There has been an error while updating the space. ${
          !!message && `(${message})`
        }`,
      )
    },
  })

  return (
    <Form {...apiForm} className="flex flex-col">
      <div className="flex flex-col md:flex-row">
        <InputPhoto
          disabled={disabled}
          name="icon"
          image={icon || defaultSpaceIcon}
        />
        <div className="flex-grow flex flex-col">
          <InputText
            disabled={disabled}
            name="name"
            label="Name"
            icon={BiText}
            className="mt-2 md:mt-0"
          />
          <InputTextarea
            disabled={disabled}
            name="description"
            label="Description"
            className="mt-2"
            icon={FiAlignCenter}
          />
        </div>
      </div>
      <SubmitButton disabled={disabled} className="ml-auto mt-4" />
    </Form>
  )
}
