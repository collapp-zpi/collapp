import Link from 'next/link'
import { IconType } from 'react-icons'
import { useRouter } from 'next/router'
import { FiSettings, FiUsers } from 'react-icons/fi'
import { CgExtension } from 'react-icons/cg'

interface SettingsButtonProps {
  href: string
  icon: IconType
  text: string
}

const SettingsButton = ({ href, icon: Icon, text }: SettingsButtonProps) => {
  const router = useRouter()

  if (router.asPath === href)
    return (
      <div className="py-3 pl-4 pr-24 rounded-2xl flex items-center my-0.5 bg-blue-500 text-white">
        <Icon className="mr-3 text-xl" />
        {text}
      </div>
    )

  return (
    <div className="my-0.5">
      <Link href={href} passHref>
        <div className="py-3 pl-4 pr-24 rounded-2xl flex items-center hover:bg-gray-200 cursor-pointer transition-colors">
          <Icon className="mr-3 text-xl" />
          {text}
        </div>
      </Link>
    </div>
  )
}

export const SpaceSettingsButtons = () => {
  const router = useRouter()
  const id = String(router.query.id)
  return (
    <>
      <SettingsButton
        href={`/spaces/${id}/settings`}
        icon={FiSettings}
        text="General info"
      />
      <SettingsButton
        href={`/spaces/${id}/settings/users`}
        icon={FiUsers}
        text="Users"
      />
      <SettingsButton
        href={`/spaces/${id}/settings/plugins`}
        icon={CgExtension}
        text="Plugins"
      />
    </>
  )
}
