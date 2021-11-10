import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { IoPersonAdd } from 'react-icons/io5'
import { MdAlternateEmail } from 'react-icons/md'
import Button from 'shared/components/button/Button'
import SubmitButton from 'shared/components/button/SubmitButton'
import { UncontrolledForm } from 'shared/components/form/UncontrolledForm'
import { InputText } from 'shared/components/input/InputText'
import Modal from 'shared/components/Modal'
import { object, string } from 'yup'

const InviteButton = () => {
  const [visible, setVisible] = useState(false)

  const schema = object().shape({
    email: string().email().required(),
  })

  const onError = () => {
    toast.error('Email was not send.')
  }

  const onSuccess = () => {
    toast.success('Email was sent')
  }

  const query = async ({ email }: { email: string }) => {
    // const response = await signIn<RedirectableProviderType>('email', {
    //   redirect: false,
    //   email,
    // })
    // if (!response || response.error) throw new Error('Login error')
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
          <InputText
            type="email"
            name="email"
            label="Email"
            icon={MdAlternateEmail}
          />
          <SubmitButton className="h-12" />
        </UncontrolledForm>
      </Modal>
    </div>
  )
}

export default InviteButton
