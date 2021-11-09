import { useRouter } from 'next/router'
import { AuthLayout } from 'layouts/AuthLayout'
import Button from 'shared/components/button/Button'
import { GoChevronLeft } from 'react-icons/go'
import { toast } from 'react-hot-toast'
import { createSpace } from 'includes/spaces/endpoints'
import { Space } from '@prisma/client'
import { UncontrolledForm } from 'shared/components/form/UncontrolledForm'
import { object, string } from 'yup'
import { InputText } from 'shared/components/input/InputText'
import { BiText } from 'react-icons/bi'
import { InputTextarea } from 'shared/components/input/InputTextarea'
import { FiAlignCenter } from 'react-icons/fi'
import SubmitButton from 'shared/components/button/SubmitButton'

const schema = object().shape({
  name: string().required().default(''),
  description: string().default(''),
})

const CreateSpace = () => {
  const router = useRouter()

  const onSuccess = (data: Space) => {
    toast.success('The space has been created successfully.')
    router.push(`/spaces/${data.id}`)
  }

  const onError = ({ message }: { message?: string }) => {
    toast.error(
      `There has been an error while creating the space. ${
        !!message && `(${message})`
      }`,
    )
  }

  return (
    <AuthLayout>
      <Button
        color="light"
        onClick={() => router.push('/spaces')}
        className="mb-4"
      >
        <GoChevronLeft className="mr-2 -ml-2" />
        Back
      </Button>
      <div className="bg-white px-8 py-8 rounded-3xl shadow-2xl">
        <UncontrolledForm
          schema={schema}
          query={createSpace}
          {...{ onSuccess, onError }}
        >
          <InputText
            name="name"
            label="Name"
            icon={BiText}
            className="mt-2 md:mt-0"
          />
          <InputTextarea
            name="description"
            label="Description"
            className="mt-2"
            icon={FiAlignCenter}
          />
          <SubmitButton className="ml-auto mt-4" />
        </UncontrolledForm>
      </div>
    </AuthLayout>
  )
}

export default CreateSpace
