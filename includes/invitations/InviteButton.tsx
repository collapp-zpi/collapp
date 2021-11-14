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

const InviteButton = ({ id }: { id: string }) => {
  const [visible, setVisible] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [link, setLink] = useState(null)

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
    toast.error('Something went wrong')
  }

  const onSuccess = () => {
    setIsGenerated(true)
  }

  const query = async (data: any) => {
    const response = await request.post(`/api/spaces/${id}/invite`, data)
    setLink(response.id)
  }

  return (
    <div>
      <Button onClick={() => setVisible(true)}>
        <IoPersonAdd className="mr-2 -ml-2" />
        Invite
      </Button>
      <Modal visible={visible} close={() => setVisible(false)}>
        {isGenerated ? (
          <div>
            <p id="link">{`${process.env.BASE_URL}/invitation/${link}`}</p>
            <Button onClick={() => setIsGenerated(false)}>
              <BiLink className="mr-2 -ml-2" />
              Generate new link
            </Button>
          </div>
        ) : (
          <div>
            <UncontrolledForm
              {...{ schema, query, onSuccess, onError }}
              className="flex"
            >
              <InputSelect
                className="w-80"
                name="timeframe"
                label="Expire at"
                options={options}
                onChange={(data: any) => {}}
                isClearable={false}
                value={null}
              ></InputSelect>
              <SubmitButton className="h-12" name="Generate">
                <BiLink className="mr-2 -ml-2" />
                Generate link
              </SubmitButton>
            </UncontrolledForm>
            {!!link && (
              <Button onClick={() => setIsGenerated(true)}>Back</Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default InviteButton
