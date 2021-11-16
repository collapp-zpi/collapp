import { useRouter } from 'next/router'
import { useState } from 'react'
import useRequest from 'shared/hooks/useRequest'
import { toast } from 'react-hot-toast'
import Button from 'shared/components/button/Button'
import Modal from 'shared/components/Modal'
import { InputTextPure } from 'shared/components/input/InputText'
import { RiErrorWarningLine } from 'react-icons/ri'
import { CgSpinner } from 'react-icons/cg'
import request from 'shared/utils/request'
import { signOut } from 'next-auth/react'

export const AccountDeleteForm = () => {
  const router = useRouter()
  const [isModalOpen, setModalOpen] = useState(false)
  const [value, setValue] = useState('')

  const verification = 'I consent'

  const handleClose = () => {
    setModalOpen(false)
    setValue('')
  }

  const deleteAccount = useRequest(async () => request.delete(`/api/user`), {
    onSuccess: () => {
      toast.success('Account was successfully deleted')
      setModalOpen(false)
      signOut()
      router.push('/')
    },
    onError: (data: any) => {
      toast.error(data.message)
    },
  })

  return (
    <>
      <h1 className="font-bold text-2xl mb-2 text-red-800">Danger zone</h1>
      <div className="flex items-center">
        <div className="flex-grow flex flex-col mr-2 text-red-700">
          <h4 className="font-bold text-md">Delete your account</h4>
          <h6 className="text-sm">This operation is irreversible</h6>
        </div>
        <Button
          className="mt-8"
          onClick={() => setModalOpen(true)}
          color="red-link"
        >
          Delete
        </Button>
      </div>
      <Modal
        visible={isModalOpen || deleteAccount.isLoading}
        close={handleClose}
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold text-red-500">Caution!</h1>
          <p>
            This operation is irreversible. This will permanently delete your
            account.
          </p>
          <p className="mt-4">
            Please type <b>{verification}</b> to confirm.
          </p>
          <InputTextPure
            icon={RiErrorWarningLine}
            className="mt-2"
            label="Verification"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <div className="flex mt-6">
            <Button onClick={handleClose} className="ml-auto" color="light">
              Cancel
            </Button>
            <Button
              onClick={deleteAccount.send}
              disabled={value !== verification || deleteAccount.isLoading}
              className="ml-2"
              color="red"
            >
              {deleteAccount.isLoading && (
                <CgSpinner className="animate-spin mr-2 -ml-2" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
