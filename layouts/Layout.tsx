import React, { ComponentProps, ReactNode, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { FiLogOut, FiSettings } from 'react-icons/fi'
import { Loading } from './Loading'
import classNames from 'classnames'
import useOnclickOutside from 'react-cool-onclickoutside'
import Button from 'shared/components/button/Button'
import { NavbarLogo } from 'shared/components/NavbarLogo'
import { CgExtension, CgGlobeAlt } from 'react-icons/cg'
import { useQuery } from 'shared/hooks/useQuery'
import Modal from 'shared/components/Modal'
import { UncontrolledForm } from 'shared/components/form/UncontrolledForm'
import SubmitButton from 'shared/components/button/SubmitButton'
import { InputText } from 'shared/components/input/InputText'
import { object, string } from 'yup'
import toast from 'react-hot-toast'
import { RedirectableProviderType } from 'next-auth/providers'
import { MdAlternateEmail } from 'react-icons/md'
import { AiOutlineMail } from 'react-icons/ai'
import { BsGoogle } from 'react-icons/bs'

const DropdownButton = ({
  children,
  className,
  ...props
}: ComponentProps<'div'>) => (
  <div
    className={classNames(
      'flex text-sm items-center py-2 px-3 cursor-pointer hover:bg-blue-500 hover:text-white rounded-md whitespace-nowrap transition-colors',
      className,
    )}
    {...props}
  >
    {children}
  </div>
)

export const Layout = ({
  children,
  hasContainer = true,
}: {
  children: ReactNode
  hasContainer?: boolean
}) => {
  const { status, data } = useSession()
  const router = useRouter()
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const ref = useOnclickOutside(() => {
    setDropdownOpen(false)
  })
  const avatarQuery = useQuery(!!data && 'user', '/api/user')

  //#region Modal
  const [visible, setVisible] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailSending, setEmailSending] = useState(false)

  const handleClose = () => {
    if (!emailSending) {
      setEmailSent(false)
      setVisible(false)
    }
  }

  const schema = object().shape({
    email: string().email().required(),
  })

  const onError = () => {
    setEmailSending(false)
    toast.error('Email was not send.')
  }

  const onSuccess = () => {
    setEmailSending(false)
    setEmailSent(true)
    toast.success('Email was sent')
  }

  const query = async ({ email }: { email: string }) => {
    setEmailSending(true)
    const response = await signIn<RedirectableProviderType>('email', {
      redirect: false,
      email,
    })
    if (!response || response.error) throw new Error('Login error')
  }

  //#endregion

  if (status === 'loading') return <Loading />

  return (
    <main className="bg-gray-100 flex flex-col h-full min-h-screen text-gray-500">
      <div className="bg-white mb-8 p-2 border-b border-gray-200 flex">
        <NavbarLogo />
        <div className="mr-auto" />
        <div className="ml-auto" />
        {status === 'unauthenticated' && (
          <div>
            <Button
              onClick={() =>
                //signIn('google', { callbackUrl: `https://localhost:3002` })
                setVisible(true)
              }
            >
              Sign in
            </Button>
            <Modal visible={visible} close={handleClose}>
              {emailSent ? (
                <div className="flex items-center justify-center space-x-2 pb-4">
                  <AiOutlineMail />
                  <h2>Check your email inbox</h2>
                </div>
              ) : (
                <div>
                  <Button
                    className="mx-auto"
                    onClick={() =>
                      signIn('google', {
                        callbackUrl: `https://localhost:3002`,
                      })
                    }
                  >
                    <BsGoogle className="-ml-2 mr-2" /> Sign with Google
                  </Button>
                  <div className="flex items-center">
                    <div className="flex-1 w-0.5 h-0.5 rounded-full mx-4 bg-gray-200" />
                    <p>OR</p>
                    <div className="flex-1 w-0.5 h-0.5 rounded-full mx-4 bg-gray-200" />
                  </div>
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
                </div>
              )}
            </Modal>
          </div>
        )}
        {status === 'authenticated' && data && (
          <div className="relative" ref={ref}>
            <div
              className="hover:bg-gray-200 cursor-pointer transition-colors rounded-xl p-1 h-full flex items-center justify-center"
              onClick={() => setDropdownOpen(!isDropdownOpen)}
            >
              <img
                src={avatarQuery?.data?.image ?? ''}
                className="bg-gray-300 w-8 h-8 rounded-25 shadow-lg"
              />
            </div>
            <div
              className={classNames(
                'absolute -bottom-1 right-0 transform translate-y-full bg-white border border-gray-200 rounded-lg p-1 shadow-lg transition-opacity z-40',
                !isDropdownOpen && 'pointer-events-none opacity-0',
              )}
            >
              <DropdownButton
                className="sm:hidden"
                onClick={() => router.push('/plugins')}
              >
                <CgExtension size="1rem" className="mr-2" />
                <span>Plugins</span>
              </DropdownButton>
              <DropdownButton
                className="sm:hidden"
                onClick={() => router.push('/published')}
              >
                <CgGlobeAlt size="1rem" className="mr-2" />
                <span>Published</span>
              </DropdownButton>
              <DropdownButton onClick={() => router.push('/settings')}>
                <FiSettings className="mr-2" />
                <span>Settings</span>
              </DropdownButton>
              <DropdownButton onClick={() => signOut()}>
                <FiLogOut className="mr-2" />
                <span>Sign out</span>
              </DropdownButton>
            </div>
          </div>
        )}
      </div>
      <div className="flex-grow pb-8 px-8">
        {hasContainer ? (
          <div className="container mx-auto max-w-screen-xl">{children}</div>
        ) : (
          children
        )}
      </div>
    </main>
  )
}
