import { ComponentProps, ReactNode } from 'react'
import Form from './Form'
import useApiForm, { useApiFormProps } from '../../hooks/useApiForm'
import { AnyObjectSchema } from 'yup'

interface UncontrolledFormProps<T extends AnyObjectSchema>
  extends Omit<ComponentProps<'form'>, 'onError'>,
    useApiFormProps<T> {
  children: ReactNode
}

export const UncontrolledForm = <T extends AnyObjectSchema>({
  schema,
  initial,
  query,
  onSuccess,
  onError,
  children,
  ...props
}: UncontrolledFormProps<T>) => {
  const apiForm = useApiForm({
    schema,
    query,
    initial,
    onSuccess,
    onError,
  })

  return (
    <Form {...apiForm} {...props}>
      {children}
    </Form>
  )
}
