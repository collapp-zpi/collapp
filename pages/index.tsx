import Head from 'next/head'
import { Layout } from 'layouts/Layout'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Modal from 'shared/components/Modal'
import { LoginForm } from 'includes/user/LoginForm'
import React, { useState } from 'react'

const Home = () => {
  const { status } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <Layout
      hasContainer={false}
      className="flex flex-col items-center justify-center"
    >
      <Head>
        <title>Collapp</title>
        <meta name="description" content="Collapp basic setup" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="text-5xl font-bold text-center">
        Collaborate like you{' '}
        <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          never did before
        </span>
      </h1>
      <h3 className="text-xl mt-2 text-center">
        Create a collaboration space to chat, plan, have fun, and much{' '}
        <b>much</b> more
      </h3>
      {status === 'authenticated' ? (
        <Link href="/spaces" passHref>
          <div className="text-xl py-3 px-9 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white font-bold mt-12 shadow-md cursor-pointer hover:scale-110 hover:shadow-xl transition-all text-center mx-auto">
            Jump in
          </div>
        </Link>
      ) : (
        <>
          <div
            onClick={() => setIsModalOpen(true)}
            className="text-xl py-3 px-9 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white font-bold mt-12 shadow-md cursor-pointer hover:scale-110 hover:shadow-xl transition-all text-center mx-auto"
          >
            Jump in
          </div>

          <Modal
            className="p-9"
            visible={isModalOpen}
            close={() => setIsModalOpen(false)}
          >
            <LoginForm />
          </Modal>
        </>
      )}
    </Layout>
  )
}

export default Home
