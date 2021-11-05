import Head from 'next/head'
import { Layout } from 'layouts/Layout'
import Link from 'next/link'
import Button from 'shared/components/button/Button'
import { signIn, useSession } from 'next-auth/react'

const Home = () => {
  const { status } = useSession()
  return (
    <Layout>
      <Head>
        <title>Collapp Developer</title>
        <meta name="description" content="Collapp developer basic setup" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-white p-12 rounded-3xl shadow-2xl overflow-hidden text-center md:text-left md:grid grid-cols-3 relative">
        <div className="flex flex-col col-span-2 items-center md:items-start">
          <h1 className="text-4xl font-bold">
            Connect like you never did before
          </h1>
          <h4 className="text-xl font-bold mt-1 text-gray-400">
            One plugin at a time
          </h4>
          <p className="text-sm text-gray-400 mt-4">
            Become a developer to create plugins connecting people all over the
            world, in real-time.
          </p>
          {status === 'authenticated' && (
            <div className="mt-4">
              <Link href={`/plugins/create`} passHref>
                <Button>Start now</Button>
              </Link>
            </div>
          )}
          {status === 'unauthenticated' && (
            <div className="mt-4">
              <Button
                onClick={() =>
                  signIn('github', {
                    callbackUrl: `${window?.location?.origin}/plugins`,
                  })
                }
              >
                Start now
              </Button>
            </div>
          )}
        </div>
        <div className="opacity-10 absolute right-0 top-1/2 w-screen max-w-sm transform -translate-y-1/2 rotate-12">
          <svg viewBox="0 0 450 450">
            <defs>
              <linearGradient
                id="collapp-front"
                x2="450"
                y2="450"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.3" stopColor="#6099d2" />
                <stop offset="0.5" stopColor="#9d64aa" />
                <stop offset="0.7" stopColor="#e175ae" />
              </linearGradient>
            </defs>
            <path
              style={{ fill: `url('#collapp-front')` }}
              d="M336.606,200H187.2a99.274,99.274,0,0,0-66.233,25A99.276,99.276,0,0,0,187.2,250h149.4A75.428,75.428,0,0,1,412,325.294v49.412A75.428,75.428,0,0,1,336.606,450H187.732A150.173,150.173,0,0,1,81.587,406.45,148.661,148.661,0,0,1,37.009,300.855c-0.007-1.285,0-2.539.027-3.807V152.69h0c-0.022-1.171-.035-2.342-0.029-3.539A148.664,148.664,0,0,1,81.587,43.55,150.175,150.175,0,0,1,187.732,0H336.606A75.429,75.429,0,0,1,412,75.294v49.412A75.429,75.429,0,0,1,336.606,200ZM187.732,400H336.606a25.34,25.34,0,0,0,25.327-25.294V325.294A25.34,25.34,0,0,0,336.606,300H187.2A149.709,149.709,0,0,1,87.1,261.81L87.1,297.857c-0.02.908-.027,1.8-0.022,2.715C87.392,355.394,132.547,400,187.732,400Zm174.2-324.706A25.339,25.339,0,0,0,336.606,50H187.732c-55.185,0-100.34,44.606-100.658,99.435,0,0.906,0,1.8.022,2.707q0.042,2.013.164,4.013c0.011,0.179.031,0.356,0.042,0.535,0.075,1.147.162,2.292,0.276,3.431,0.031,0.314.077,0.625,0.111,0.939,0.109,1,.222,2,0.361,2.989,0.055,0.392.125,0.78,0.185,1.17,0.138,0.908.276,1.816,0.439,2.718,0.08,0.445.177,0.885,0.263,1.328,0.164,0.841.325,1.683,0.51,2.518,0.107,0.483.231,0.961,0.345,1.442,0.187,0.788.371,1.578,0.578,2.361,0.134,0.51.285,1.014,0.428,1.522,0.209,0.746.416,1.493,0.642,2.234,0.162,0.528.34,1.052,0.511,1.577,0.231,0.712.459,1.424,0.706,2.13,0.038,0.108.08,0.213,0.118,0.32A149.592,149.592,0,0,1,187.2,150h149.4a25.34,25.34,0,0,0,25.327-25.294V75.294Z"
            />
          </svg>
        </div>
      </div>
    </Layout>
  )
}

export default Home
