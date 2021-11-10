import { SessionProvider } from 'next-auth/react'
import { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import 'config/dayjs'
import 'styles/globals.css'
import 'styles/draggable.css'

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
      <Toaster position="bottom-right" />
    </SessionProvider>
  )
}
export default MyApp
