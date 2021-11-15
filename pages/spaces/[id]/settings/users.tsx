import Head from 'next/head'
import { useRouter } from 'next/router'
import Button from 'shared/components/button/Button'
import { GoChevronLeft } from 'react-icons/go'
import { SpaceSettingsButtons } from 'includes/spaces/components/SpaceSettingsButtons'
import React, { useState } from 'react'
import InviteButton from 'includes/invitations/InviteButton'
import { withAuth } from 'shared/hooks/useAuth'
import { Layout } from 'layouts/Layout'
import { GetServerSidePropsContext } from 'next'
import { generateKey } from 'shared/utils/object'
import { useQuery } from 'shared/hooks/useQuery'
import { Loading } from 'layouts/Loading'
import { withFallback } from 'shared/hooks/useApiForm'
import { SpaceUser } from '.pnpm/@prisma+client@3.3.0_prisma@3.3.0/node_modules/.prisma/client'
import { useSWRConfig } from 'swr'
import request from 'shared/utils/request'
import toast from 'react-hot-toast'

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { id } = context.query
  const res = await fetch(`${process.env.BASE_URL}/api/spaces/${id}/users`, {
    method: 'GET',
    headers: {
      ...(context?.req?.headers?.cookie && {
        cookie: context.req.headers.cookie,
      }),
    },
  })

  const permissions = await fetch(
    `${process.env.BASE_URL}/api/spaces/${id}/permissions`,
    {
      method: 'GET',
      headers: {
        ...(context?.req?.headers?.cookie && {
          cookie: context.req.headers.cookie,
        }),
      },
    },
  )

  if (!res.ok) {
    return {
      props: {
        error: await res.json(),
      },
    }
  }

  if (!permissions.ok) {
    return {
      props: {
        error: await permissions.json(),
      },
    }
  }

  return {
    props: {
      fallback: {
        [generateKey('space', String(id), 'users')]: await res.json(),
        [generateKey('permissions', String(id))]: await permissions.json(),
      },
    },
  }
}

const SpaceUserSettings = () => {
  const router = useRouter()
  const pathId = String(router.query.id)
  const id = pathId

  const [deleting, setDeleting] = useState(false)
  const { mutate } = useSWRConfig()

  const { data } = useQuery(['space', id, 'users'], `/api/spaces/${id}/users`)

  const permissions = useQuery(
    ['permissions', pathId],
    `/api/spaces/${pathId}/permissions`,
  )

  const handleRemove = async (userId: string) => {
    setDeleting(true)
    await request.delete(`/api/spaces/${id}/user/${userId}`)
    setDeleting(false)
    mutate(generateKey('space', String(id), 'users'))
    toast.success('User was successfully removed from space')
  }

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
          <div className="bg-white px-8 py-8 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl">Users</h1>
              {!!permissions.data &&
                (permissions.data.canInvite || permissions.data.isOwner) && (
                  <InviteButton id={pathId} />
                )}
            </div>
            {!data ? (
              <div className="m-auto">
                <Loading />
              </div>
            ) : (
              <table className="mt-8">
                <thead></thead>
                <tbody>
                  {data.map((spaceUser: SpaceUser) => (
                    <tr key={spaceUser.userId}>
                      <td>
                        <img
                          src={spaceUser.user.image || ''}
                          alt="User avatar"
                          className={`w-10 h-10 rounded-full`}
                        />
                      </td>
                      <td>{spaceUser.user.name}</td>
                      <td>
                        {spaceUser.isOwner ? (
                          <span>Owner</span>
                        ) : (
                          !!permissions.data &&
                          (permissions.data.canInvite ||
                            permissions.data.isOwner) && (
                            <Button
                              disabled={deleting}
                              color="red"
                              onClick={() => handleRemove(spaceUser.userId)}
                            >
                              Remove
                            </Button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default withAuth(withFallback(SpaceUserSettings))
