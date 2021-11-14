import { ComponentType } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Loading } from 'layouts/Loading'

export const withAuth = <T,>(Component: ComponentType<T>) =>
  function FallbackComponent(props: T) {
    const { status } = useSession()
    const router = useRouter()

    if (status === 'loading') {
      return <Loading />
    }

    if (status === 'unauthenticated') {
      router.push('/')
      return null
    }

    return <Component {...props} />
  }
