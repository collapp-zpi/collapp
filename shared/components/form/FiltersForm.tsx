import { ReactNode, useEffect, useRef } from 'react'
import { AnyObjectSchema } from 'yup'
import { useFilters } from 'shared/hooks/useFilters'
import { useRequestOptionsType } from 'shared/hooks/useRequest'
import { UncontrolledForm } from 'shared/components/form/UncontrolledForm'
import { AutoSubmit } from 'shared/components/form/AutoSubmit'
import { useFormContext } from 'react-hook-form'
import { useRouter } from 'next/router'

interface FiltersFormProps<T> {
  schema: T
  onSuccess?: useRequestOptionsType['onSuccess']
  onError?: useRequestOptionsType['onError']
  children: ReactNode
}

const AutoResetForm = ({ initial = {} }) => {
  const form = useFormContext()
  const router = useRouter()
  const path = useRef(router.asPath)

  useEffect(() => {
    if (path.current === router.asPath) return
    form.reset(initial)
    path.current = router.asPath
  }, [initial])

  return null
}

export const FiltersForm = <T extends AnyObjectSchema>({
  schema,
  onSuccess,
  onError,
  children,
  ...props
}: FiltersFormProps<T>) => {
  const [filters, setFilters] = useFilters()

  return (
    <UncontrolledForm
      schema={schema}
      initial={filters}
      query={async (filters) => setFilters(filters)}
      {...{ onSuccess, onError }}
      {...props}
    >
      {children}
      <AutoResetForm initial={filters} />
      <AutoSubmit />
    </UncontrolledForm>
  )
}
