import { FormProvider } from 'react-hook-form'
import { ComponentProps, createContext, ReactNode, useContext } from 'react'
import useApiForm from '../../hooks/useApiForm'
import useRequest, { RequestState } from '../../hooks/useRequest'

interface FormProps
  extends ReturnType<typeof useApiForm>,
    Omit<ComponentProps<'form'>, 'onError'> {
  children: ReactNode
}

const RequestContext = createContext<ReturnType<typeof useRequest>>({
  send: async () => undefined,
  status: RequestState.Pending,
  isLoading: false,
})

export const useApiRequest = () => useContext(RequestContext)

const Form = ({ methods, request, children, ...props }: FormProps) => (
  <FormProvider {...methods}>
    <RequestContext.Provider value={request}>
      <form onSubmit={methods.handleSubmit(request.send)} {...props}>
        {children}
      </form>
    </RequestContext.Provider>
  </FormProvider>
)

export default Form
