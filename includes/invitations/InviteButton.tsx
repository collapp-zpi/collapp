import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { IoPersonAdd } from 'react-icons/io5'
import Button from 'shared/components/button/Button'
import SubmitButton from 'shared/components/button/SubmitButton'
import { UncontrolledForm } from 'shared/components/form/UncontrolledForm'
import { InputSelect } from 'shared/components/input/InputSelect'
import Modal from 'shared/components/Modal'
import { object, string } from 'yup'

const InviteButton = () => {
  const [visible, setVisible] = useState(false)
  const options: any = [
    { label: '1 day', value: '1' },
    { label: '3 days', value: '3' },
    { label: '7 days', value: '7' },
    { label: 'Never', value: '0' },
  ]

  const schema = object().shape({
    timeframe: string().required(),
  })

  const onError = () => {
    toast.error('Email was not send.')
  }

  const onSuccess = () => {
    toast.success('Email was sent')
  }

  const query = async ({ timeframe }: { timeframe: string }) => {
    // const response = await signIn<RedirectableProviderType>('email', {
    //   redirect: false,
    //   email,
    // })
    // if (!response || response.error) throw new Error('Login error')
    console.log(timeframe)
  }

  return (
    <div>
      <Button onClick={() => setVisible(true)}>
        <IoPersonAdd className="mr-2 -ml-2" />
        Invite
      </Button>
      <Modal visible={visible} close={() => setVisible(false)}>
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
            Generate link
          </SubmitButton>
        </UncontrolledForm>
      </Modal>
    </div>
  )
}

export default InviteButton
