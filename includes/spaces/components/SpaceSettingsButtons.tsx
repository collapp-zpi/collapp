import Link from 'next/link'
import { IconType } from 'react-icons'
import { useRouter } from 'next/router'
import { FiSettings, FiUsers } from 'react-icons/fi'
import { CgExtension, CgSpinner } from 'react-icons/cg'
import Button from 'shared/components/button/Button'
import React, { useState } from 'react'
import { IoExitOutline } from 'react-icons/io5'
import { MdOutlineDelete } from 'react-icons/md'
import Modal from 'shared/components/Modal'
import request from 'shared/utils/request'
import useRequest from 'shared/hooks/useRequest'
import toast from 'react-hot-toast'

interface SettingsButtonProps {
  href: string
  icon: IconType
  text: string
}

const SettingsButton = ({ href, icon: Icon, text }: SettingsButtonProps) => {
  const router = useRouter()

  if (router.asPath === href)
    return (
      <div className="py-3 pl-4 pr-24 rounded-2xl flex items-center my-0.5 bg-blue-500 text-white">
        <Icon className="mr-3 text-xl" />
        {text}
      </div>
    )

  return (
    <div className="my-0.5">
      <Link href={href} passHref>
        <div className="py-3 pl-4 pr-24 rounded-2xl flex items-center hover:bg-gray-200 cursor-pointer transition-colors">
          <Icon className="mr-3 text-xl" />
          {text}
        </div>
      </Link>
    </div>
  )
}

export const SpaceSettingsButtons = ({
  canEdit,
  isOwner,
}: {
  canEdit: boolean
  isOwner: boolean
}) => {
  const router = useRouter()
  const id = String(router.query.id)

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
    <>
      <SettingsButton
        href={`/spaces/${id}/settings`}
        icon={FiSettings}
        text="General info"
      />
      <SettingsButton
        href={`/spaces/${id}/settings/users`}
        icon={FiUsers}
        text="Users"
      />
      {(canEdit || isOwner) && (
        <SettingsButton
          href={`/spaces/${id}/settings/plugins`}
          icon={CgExtension}
          text="Plugins"
        />
      )}
      {isOwner ? (
        <div>
          <Button
            color="red-link"
            className="mt-10 py-3 pl-4 pr-24 rounded-2xl flex items-center my-0.5"
            onClick={() => setDeleteSpaceModal(true)}
          >
            <MdOutlineDelete className="mr-3 text-xl" />
            Delete Space
          </Button>
          <Modal visible={deleteSpaceModal || deleteSpace.isLoading}>
            <div className="p-4">
              <h1 className="text-2xl font-bold text-red-500">Careful!</h1>
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
          <Button
            color="red-link"
            className="mt-10 py-3 pl-4 pr-24 rounded-2xl flex items-center my-0.5"
            onClick={() => setLeaveSpaceModal(true)}
          >
            <IoExitOutline className="mr-3 text-xl" />
            Leave Space
          </Button>
          <Modal visible={leaveSpaceModal || leaveSpace.isLoading}>
            <div className="p-4">
              <h1 className="text-2xl font-bold text-red-500">Careful!</h1>
              <p>Are you sure you want to leave this space?</p>
              <div className="flex justify-end mt-8">
                <Button color="light" onClick={() => setLeaveSpaceModal(false)}>
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
    </>
  )
}
