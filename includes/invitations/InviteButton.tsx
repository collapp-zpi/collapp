import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { IoPersonAdd } from 'react-icons/io5'
import Button from 'shared/components/button/Button'
import SubmitButton from 'shared/components/button/SubmitButton'
import { UncontrolledForm } from 'shared/components/form/UncontrolledForm'
import { InputSelect } from 'shared/components/input/InputSelect'
import Modal from 'shared/components/Modal'
import { object, string } from 'yup'
import request from 'shared/utils/request'
import { BiLink } from 'react-icons/bi'
import { InputTextPure } from 'shared/components/input/InputText'
import copy from 'copy-to-clipboard'
import { HiOutlineClipboardCopy } from 'react-icons/hi'
import { Tooltip } from 'shared/components/Tooltip'
import { useSWRConfig } from 'swr'
import { generateKey } from 'shared/utils/object'

const InviteButton = ({ spaceId }: { spaceId: string }) => {
  const [visible, setVisible] = useState(false)
  const [link, setLink] = useState(null)

  const { mutate } = useSWRConfig()

  const options: any = [
    { label: '1 day', value: '1' },
    { label: '3 days', value: '3' },
    { label: '7 days', value: '7' },
    { label: 'Never', value: '0' },
  ]

  const schema = object().shape({
    timeframe: string().required(),
  })

  const onError = (data: any) => {
    toast.error(data.message)
  }

  const onSuccess = ({ id }) => {
    setLink(id)
    mutate(generateKey('invitations', spaceId))
  }

  const url = `${process.env.BASE_URL}/invitation/${link}`

  const handleCopy = () => {
    copy(url)
    toast.success('The link has been copied to the clipboard.')
  }

  return (
    <div>
      <Button onClick={() => setVisible(true)}>
        <IoPersonAdd className="mr-2 -ml-2" />
        Invite
      </Button>
      <Modal visible={visible} close={() => setVisible(false)}>
        {!!link ? (
          <div className="flex flex-col">
            <div className="flex w-72">
              <InputTextPure
                readOnly
                value={url}
                label="Link"
                className="flex-grow"
              />
              <Tooltip
                value="Copy to clipboard"
                className="ml-2"
                innerClassName="h-full"
              >
                <Button onClick={handleCopy} hasIcon className="h-full">
                  <HiOutlineClipboardCopy className="mx-2 text-xl" />
                </Button>
              </Tooltip>
            </div>
            <Button
              color="light"
              onClick={() => setLink(null)}
              className="mt-4"
            >
              <BiLink className="mr-2 -ml-2" />
              Generate a new link
            </Button>
          </div>
        ) : (
          <div>
            <UncontrolledForm
              query={(data) =>
                request.post(`/api/spaces/${spaceId}/invite`, data)
              }
              {...{ schema, onSuccess, onError }}
              className="flex flex-col"
            >
              <InputSelect
                className="w-72"
                name="timeframe"
                label="Expire at"
                options={options}
                onChange={(data: any) => {}}
                isClearable={false}
                isSearchable={false}
                value={null}
              />
              <SubmitButton className="mt-2">
                <BiLink className="mr-2 -ml-2" />
                Generate link
              </SubmitButton>
            </UncontrolledForm>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default InviteButton
