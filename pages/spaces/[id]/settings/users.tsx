import Head from 'next/head'
import { useRouter } from 'next/router'
import Button from 'shared/components/button/Button'
import { GoChevronLeft } from 'react-icons/go'
import { SpaceSettingsButtons } from 'includes/spaces/components/SpaceSettingsButtons'
import React from 'react'
import InviteButton from 'includes/invitations/InviteButton'
import { withAuth } from 'shared/hooks/useAuth'
import { Layout } from 'layouts/Layout'

const SpaceUserSettings = () => {
  const router = useRouter()
  const pathId = String(router.query.id)
  const id = pathId

  return (
    <Layout>
      <Head>
        <title>Space settings</title>
      </Head>
      <Button
        color="light"
        onClick={() => router.push(`/spaces/${id}`)}
        className="mb-4"
      >
        <GoChevronLeft className="mr-2 -ml-2" />
        Back
      </Button>
      <div className="flex">
        <div className="flex flex-col mr-12">
          <SpaceSettingsButtons />
        </div>
        <div className="flex-grow">
          <InviteButton id={pathId} />
          <div className="bg-white px-8 py-8 rounded-3xl shadow-2xl">Users</div>
        </div>
      </div>
    </Layout>
  )
}

export default withAuth(SpaceUserSettings)
