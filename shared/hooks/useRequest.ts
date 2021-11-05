import { useState } from 'react'

export enum RequestState {
  Pending = 'Pending',
  Loading = 'Loading',
  Error = 'Error',
  Success = 'Success',
}

export type useRequestErrorType = { message: string }
export type useRequestQueryType = (...args: any) => Promise<any>
export type useRequestOptionsType = {
  onSuccess?: <T>(data: T) => void
  onError?: (error: useRequestErrorType) => void
}

const useRequest = <T extends useRequestQueryType>(
  query: T,
  { onSuccess, onError }: useRequestOptionsType = {},
) => {
  const [status, setStatus] = useState(RequestState.Pending)

  const send = async (...args: Parameters<T>) => {
    setStatus(RequestState.Loading)

    const catchError = (error: useRequestErrorType) => {
      setStatus(RequestState.Error)
      if (onError) onError(error)
    }

    try {
      const response = await query(...args)

      setStatus(RequestState.Success)
      if (onSuccess) onSuccess(response)
    } catch (e: any) {
      catchError({ message: e?.message })
    }
  }

  const isLoading = status === RequestState.Loading

  return { send, status, isLoading }
}

export default useRequest
