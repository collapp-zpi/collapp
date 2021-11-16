import React, { useState } from 'react'
import { AiOutlineMail } from 'react-icons/ai'
import Button from 'shared/components/button/Button'
import { signIn } from 'next-auth/react'
import { BsGoogle } from 'react-icons/bs'
import { UncontrolledForm } from 'shared/components/form/UncontrolledForm'
import { InputText } from 'shared/components/input/InputText'
import { MdAlternateEmail } from 'react-icons/md'
import SubmitButton from 'shared/components/button/SubmitButton'
import { object, string } from 'yup'
import toast from 'react-hot-toast'
import { RedirectableProviderType } from 'next-auth/providers'

const schema = object().shape({
  email: string().email().required(),
})

export const LoginForm = () => {
  const [emailSent, setEmailSent] = useState(false)

  const onError = () => {
    toast.error('Email was not send.')
  }

  const onSuccess = () => {
    setEmailSent(true)
    toast.success('Email was sent')
  }

  const query = async ({ email }: { email: string }) => {
    const response = await signIn<RedirectableProviderType>('email', {
      redirect: false,
      email,
    })
    if (!response || response.error) throw new Error('Login error')
  }

  if (emailSent)
    return (
      <div className="flex items-center justify-center space-x-2">
        <AiOutlineMail />
        <h2>Check your email inbox</h2>
      </div>
    )

  return (
    <div>
      <Button className="w-full" onClick={() => signIn('google')}>
        <BsGoogle className="-ml-2 mr-2" /> Sign with Google
      </Button>
      <div className="flex items-center my-8">
        <div className="flex-1 w-0.5 h-0.5 rounded-full mx-4 bg-gray-200" />
        <p>OR</p>
        <div className="flex-1 w-0.5 h-0.5 rounded-full mx-4 bg-gray-200" />
      </div>
      <UncontrolledForm
        {...{ schema, query, onSuccess, onError }}
        className="flex flex-col"
      >
        <InputText
          type="email"
          name="email"
          label="Email"
          autoComplete="email"
          icon={MdAlternateEmail}
        />
        <SubmitButton className="mt-2" />
      </UncontrolledForm>
    </div>
  )
}
