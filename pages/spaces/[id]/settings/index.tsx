import { GetServerSidePropsContext } from 'next'
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
import Modal from 'shared/components/Modal'
import { CgSpinner } from 'react-icons/cg'
import React, { useState } from 'react'
import useRequest from 'shared/hooks/useRequest'
import request from 'shared/utils/request'
import { fetchApiFallback } from 'shared/utils/fetchApi'

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const id = String(context.query.id)
  const fetch = fetchApiFallback(context)

  const space = await fetch(['space', id], `/api/spaces/${id}`)
  const permissions = await fetch(
    ['permissions', id],
    `/api/spaces/${id}/permissions`,
  )

  return {
    props: {
      fallback: {
        ...space,
        ...permissions,
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

  const [deleteSpaceModal, setDeleteSpaceModal] = useState(false)
  const deleteSpace = useRequest(
    async () => request.delete(`/api/spaces/${id}`),
    {
      onSuccess: () => {
        toast.success('Space was successfully deleted.')
        setDeleteSpaceModal(false)
        router.push('/spaces')
      },
      onError: (data: any) => {
        toast.error(data.message)
      },
    },
  )

  const [leaveSpaceModal, setLeaveSpaceModal] = useState(false)
  const leaveSpace = useRequest(
    async () => request.delete(`/api/spaces/${id}/user`),
    {
      onSuccess: () => {
        toast.success('You left the space.')
        setLeaveSpaceModal(false)
        router.push('/spaces')
      },
      onError: (data: any) => {
        toast.error(data.message)
      },
    },
  )

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

            <div className="bg-white px-8 py-8 mt-12 rounded-3xl shadow-2xl">
              <h1 className="font-bold text-2xl mb-2">Manage</h1>

              {permissions.data.isOwner ? (
                <div>
                  <div className="flex items-center">
                    <div className="flex-grow flex flex-col mr-2 text-red-700">
                      <h4 className="font-bold text-md">Delete space</h4>
                      <h6 className="text-sm">
                        This operation is irreversible
                      </h6>
                    </div>
                    <Button
                      className="mt-8"
                      onClick={() => setDeleteSpaceModal(true)}
                      color="red-link"
                    >
                      Delete
                    </Button>
                  </div>

                  <Modal visible={deleteSpaceModal || deleteSpace.isLoading}>
                    <div className="p-4">
                      <h1 className="text-2xl font-bold">Careful!</h1>
                      <p>Are you sure you want to remove this space?</p>
                      <div className="flex justify-end mt-8">
                        <Button
                          color="light"
                          onClick={() => setDeleteSpaceModal(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          color="red"
                          className="ml-2"
                          onClick={deleteSpace.send}
                          disabled={deleteSpace.isLoading}
                        >
                          {deleteSpace.isLoading && (
                            <CgSpinner className="animate-spin mr-2 -ml-2" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Modal>
                </div>
              ) : (
                <div>
                  <div className="flex items-center">
                    <div className="flex-grow flex flex-col mr-2">
                      <h4 className="font-bold text-md">Leave space</h4>
                      <h6 className="text-sm">
                        You will no longer have access to this space
                      </h6>
                    </div>
                    <Button
                      className="mt-8"
                      onClick={() => setLeaveSpaceModal(true)}
                      color="red-link"
                    >
                      Leave
                    </Button>
                  </div>

                  <Modal visible={leaveSpaceModal || leaveSpace.isLoading}>
                    <div className="p-4">
                      <h1 className="text-2xl font-bold text-red-500">
                        Careful!
                      </h1>
                      <p>Are you sure you want to leave this space?</p>
                      <div className="flex justify-end mt-8">
                        <Button
                          color="light"
                          onClick={() => setLeaveSpaceModal(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          color="red"
                          className="ml-2"
                          onClick={leaveSpace.send}
                          disabled={leaveSpace.isLoading}
                        >
                          {leaveSpace.isLoading && (
                            <CgSpinner className="animate-spin mr-2 -ml-2" />
                          )}
                          Leave
                        </Button>
                      </div>
                    </div>
                  </Modal>
                </div>
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
