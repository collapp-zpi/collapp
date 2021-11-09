import Head from 'next/head'
import { AuthLayout } from 'layouts/AuthLayout'

const Spaces = () => {
  return (
    <AuthLayout>
      <Head>
        <title>Spaces</title>
      </Head>
      <h1 className="text-2xl font-bold text-gray-500 mb-4">Spaces</h1>
    </AuthLayout>
  )
}

export default Spaces
