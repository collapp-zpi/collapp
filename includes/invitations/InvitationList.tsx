import { Invite } from '.pnpm/@prisma+client@3.3.0_prisma@3.3.0/node_modules/.prisma/client'
import copy from 'copy-to-clipboard'
import dayjs from 'dayjs'
import React from 'react'
import toast from 'react-hot-toast'
import { FiTrash2 } from 'react-icons/fi'
import { HiOutlineClipboardCopy } from 'react-icons/hi'
import Button from 'shared/components/button/Button'
import { Tooltip } from 'shared/components/Tooltip'
import useRequest from 'shared/hooks/useRequest'
import { generateKey } from 'shared/utils/object'
import request from 'shared/utils/request'
import { useSWRConfig } from 'swr'

const InvitationList = ({
  data,
  spaceId,
}: {
  data: Invite[]
  spaceId: string
}) => {
  const { mutate } = useSWRConfig()
  const deleteInvitation = useRequest(
    (id: string) => request.delete(`/api/invitation/${id}`),
    {
      onSuccess: () => {
        toast.success('Invitation was successfully deleted')
        mutate(generateKey('invitations', spaceId))
      },
      onError: (data: any) => {
        toast.error(data.message)
      },
    },
  )

  const handleCopy = (url: string) => {
    copy(url)
    toast.success('The link has been copied to the clipboard.')
  }

  return (
    <table className="mt-8 w-full">
      <thead>
        <tr>
          <th>Expires at</th>
        </tr>
      </thead>
      <tbody>
        {data.map((invite: Invite) => (
          <tr key={invite.id}>
            <td>
              {invite.expiresAt
                ? dayjs(invite.expiresAt).format('LLL')
                : 'Never'}
            </td>
            <td className="p-3 flex justify-end">
              <Tooltip value="Delete">
                <Button
                  disabled={deleteInvitation.isLoading}
                  color="red-link"
                  hasIcon
                  onClick={() => deleteInvitation.send(invite.id)}
                >
                  <FiTrash2 />
                </Button>
              </Tooltip>
              <Tooltip value="Copy" className="ml-2">
                <Button
                  color="blue-link"
                  hasIcon
                  onClick={() =>
                    handleCopy(
                      `${process.env.BASE_URL}/invitation/${invite.id}`,
                    )
                  }
                >
                  <HiOutlineClipboardCopy />
                </Button>
              </Tooltip>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default InvitationList
