import { ComponentType } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { LogoSpinner } from 'shared/components/LogoSpinner'

export const withAuth = <T,>(Component: ComponentType<T>) =>
  function FallbackComponent(props: T) {
    const { status } = useSession()
    const router = useRouter()

    if (status === 'loading') {
      return (
        <main className="bg-gray-100 flex flex-col h-full min-h-screen text-gray-500">
          <LogoSpinner />
        </main>
      )
    }

    if (status === 'unauthenticated') {
      router.push('/')
      return null
    }

    return <Component {...props} />
  }
