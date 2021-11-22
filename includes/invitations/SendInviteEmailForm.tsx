import React from 'react'
import toast from 'react-hot-toast'
import { MdAlternateEmail } from 'react-icons/md'
import SubmitButton from 'shared/components/button/SubmitButton'
import Form from 'shared/components/form/Form'
import { InputText } from 'shared/components/input/InputText'
import useApiForm from 'shared/hooks/useApiForm'
import request from 'shared/utils/request'
import { object, string } from 'yup'

const schema = object().shape({
  email: string().email().required().default(''),
})

const SendInviteEmailForm = ({ link }: { link: string }) => {
  const apiForm = useApiForm({
    query: (data: any) => request.post(`/api/invitations/${link}/send`, data),
    schema,
    onSuccess: (_, methods) => {
      toast.success('Email was sent')
      methods.reset()
    },
    onError: (data: any) => {
      toast.error(data.message)
    },
  })

  return (
    <Form {...apiForm} className="flex w-96 items-center">
      <InputText
        className="flex-1"
        type="email"
        name="email"
        label="Email"
        autoComplete="email"
        icon={MdAlternateEmail}
      />
      <SubmitButton className="h-12 ml-2">Send</SubmitButton>
    </Form>
  )
}

export default SendInviteEmailForm
