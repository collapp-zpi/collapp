import Head from 'next/head'
import { useRouter } from 'next/router'
import Button from 'shared/components/button/Button'
import { GoChevronLeft } from 'react-icons/go'
import { SpaceSettingsButtons } from 'includes/spaces/components/SpaceSettingsButtons'
import React, { useState } from 'react'
import InviteButton from 'includes/invitations/InviteButton'
import { withAuth } from 'shared/hooks/useAuth'
import { Layout } from 'layouts/Layout'
import { generateKey } from 'shared/utils/object'
import { useQuery } from 'shared/hooks/useQuery'
import { Loading } from 'layouts/Loading'
import { SpaceUser } from '.pnpm/@prisma+client@3.3.0_prisma@3.3.0/node_modules/.prisma/client'
import { useSWRConfig } from 'swr'
import request from 'shared/utils/request'
import toast from 'react-hot-toast'
import useRequest from 'shared/hooks/useRequest'
import { defaultPluginIcon } from 'shared/utils/defaultIcons'
import { InputCheckboxPure } from 'shared/components/input/InputCheckbox'
import { FiTrash2 } from 'react-icons/fi'
import { Tooltip } from 'shared/components/Tooltip'
import { CgSpinner } from 'react-icons/cg'
import { RiVipCrownLine } from 'react-icons/ri'
import Modal from 'shared/components/Modal'
import InvitationList from 'includes/invitations/InvitationList'

const SpaceUserSettings = () => {
  const router = useRouter()
  const id = String(router.query.id)

  const { data } = useQuery(['space', id, 'users'], `/api/spaces/${id}/users`)
  const invitations = useQuery(
    ['invitations', id],
    `/api/invitations/space/${id}`,
  )

  const permissions = useQuery(
    ['permissions', id],
    `/api/user/space/${id}/permissions`,
  )

  const canEdit =
    !!permissions.data && (permissions.data.canEdit || permissions.data.isOwner)

  const canViewInvites =
    !!invitations.data &&
    invitations.data.length > 0 &&
    !!permissions.data &&
    (permissions.data.canInvite || permissions.data.isOwner)

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
      <div className="flex">
        <div className="flex flex-col mr-12">
          {canEdit ? (
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
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl">Users</h1>
              {canEdit && <InviteButton spaceId={id} />}
            </div>
            {!data ? (
              <div className="m-auto">
                <Loading />
              </div>
            ) : (
              <PermissionsForm
                data={data}
                isOwner={permissions?.data?.isOwner}
              />
            )}
          </div>
          {canViewInvites && (
            <div className="bg-white mt-8 px-8 py-8 rounded-3xl shadow-2xl">
              <h1 className="font-bold text-xl">Invitations</h1>
              <InvitationList data={invitations.data} spaceId={id} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default withAuth(SpaceUserSettings)

const PermissionsForm = ({ data, isOwner }) => {
  const router = useRouter()
  const id = String(router.query.id)
  const [state, setState] = useState(() => {
    const state: { [key: string]: { canEdit: boolean; canInvite: boolean } } =
      {}
    for (const { userId, canEdit, canInvite } of data) {
      state[userId] = { canEdit, canInvite }
    }
    return state
  })
  const [wasEdited, setWasEdited] = useState(false)
  const [removeModal, setRemoveModal] = useState<string | null>(null)
  const [transferModal, setTransferModal] = useState<string | null>(null)

  const { mutate } = useSWRConfig()

  const deleteUser = useRequest(
    async (userId: string) =>
      request.delete(`/api/spaces/${id}/user/${userId}`),
    {
      onSuccess: () => {
        toast.success('User was successfully removed from space')
        mutate(generateKey('space', id, 'users'))
        setRemoveModal(null)
      },
      onError: () => {
        toast.error('There was an error while removing the user from space')
      },
    },
  )

  const updateUsers = useRequest(
    () => request.patch(`/api/spaces/${id}/permissions`, state),
    {
      onSuccess: () => {
        toast.success('Permissions were successfully updated')
        mutate(generateKey('space', id, 'users'))
        setWasEdited(false)
      },
      onError: () => {
        toast.error('There was an error updating the permissions')
      },
    },
  )

  const transferOwner = useRequest(
    (userId: string) =>
      request.patch(`/api/spaces/${id}/transfer-ownership`, userId),
    {
      onSuccess: () => {
        toast.success('The ownership was successfully transferred')
        mutate(generateKey('space', id, 'users'))
        mutate(generateKey('permissions', id))
        setTransferModal(null)
      },
      onError: () => {
        toast.error('There was an error transferring the ownership')
      },
    },
  )

  const updatePermission = (id: string, permission: string) => () => {
    setWasEdited(true)
    setState({
      ...state,
      [id]: {
        ...state[id],
        [permission]: !state[id][permission],
      },
    })
  }

  const closeRemoveModal = () => setRemoveModal(null)
  const closeTransferModal = () => setTransferModal(null)

  return (
    <>
      <Modal
        visible={!!removeModal || deleteUser.isLoading}
        close={closeRemoveModal}
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold text-red-500">Careful!</h1>
          <p>Are you sure you want to remove this user?</p>
          <div className="flex justify-end mt-8">
            <Button color="light" onClick={closeRemoveModal}>
              Cancel
            </Button>
            <Button
              color="red"
              className="ml-2"
              onClick={() => deleteUser.send(removeModal as string)}
              disabled={deleteUser.isLoading}
            >
              {deleteUser.isLoading && (
                <CgSpinner className="animate-spin mr-2 -ml-2" />
              )}
              Remove
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        visible={!!transferModal || transferOwner.isLoading}
        close={closeTransferModal}
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold text-blue-600">Attention!</h1>
          <p>Are you sure you want to transfer ownership?</p>
          <div className="flex justify-end mt-8">
            <Button color="light" onClick={closeTransferModal}>
              Cancel
            </Button>
            <Button
              color="blue"
              className="ml-2"
              onClick={() => transferOwner.send(transferModal as string)}
              disabled={transferOwner.isLoading}
            >
              {transferOwner.isLoading && (
                <CgSpinner className="animate-spin mr-2 -ml-2" />
              )}
              Transfer
            </Button>
          </div>
        </div>
      </Modal>
      <table className="mt-8 w-full">
        <thead>
          <tr>
            <th>User</th>
            <th>Invite</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {data.map((spaceUser: SpaceUser) => (
            <tr key={spaceUser.userId}>
              <td className="flex items-center p-3">
                <img
                  src={spaceUser.user.image || defaultPluginIcon}
                  alt="User avatar"
                  className="w-8 h-8 rounded-25 mr-2 bg-white"
                />
                {spaceUser.user.name}
              </td>
              <td>
                {!spaceUser.isOwner && (
                  <InputCheckboxPure
                    checked={state?.[spaceUser.userId]?.canInvite}
                    onChange={updatePermission(spaceUser.userId, 'canInvite')}
                    disabled={!isOwner}
                    className="p-3 w-full flex justify-center"
                  />
                )}
              </td>
              <td>
                {!spaceUser.isOwner && (
                  <InputCheckboxPure
                    checked={state?.[spaceUser.userId]?.canEdit}
                    onChange={updatePermission(spaceUser.userId, 'canEdit')}
                    disabled={!isOwner}
                    className="p-3 w-full flex justify-center"
                  />
                )}
              </td>
              <td className="p-3 flex justify-end">
                {!spaceUser.isOwner && isOwner && (
                  <Tooltip value="Remove">
                    <Button
                      disabled={deleteUser.isLoading}
                      color="red-link"
                      hasIcon
                      onClick={() => setRemoveModal(spaceUser.userId)}
                    >
                      {deleteUser.isLoading ? (
                        <CgSpinner className="animate-spin" />
                      ) : (
                        <FiTrash2 />
                      )}
                    </Button>
                  </Tooltip>
                )}
                {!spaceUser.isOwner && isOwner && (
                  <Tooltip value="Transfer ownership" className="ml-2">
                    <Button
                      disabled={transferOwner.isLoading}
                      color="blue-link"
                      hasIcon
                      onClick={() => setTransferModal(spaceUser.userId)}
                    >
                      {transferOwner.isLoading ? (
                        <CgSpinner className="animate-spin" />
                      ) : (
                        <RiVipCrownLine />
                      )}
                    </Button>
                  </Tooltip>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex">
        <Button
          disabled={!wasEdited || updateUsers.isLoading}
          className="ml-auto"
          onClick={() => updateUsers.send()}
        >
          {updateUsers.isLoading && (
            <CgSpinner className="animate-spin mr-2 -ml-2" />
          )}
          Submit
        </Button>
      </div>
    </>
  )
}
