import Head from 'next/head'
import { Layout } from 'layouts/Layout'

const Home = () => (
  <Layout>
    <Head>
      <title>Collapp</title>
      <meta name="description" content="Collapp basic setup" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  </Layout>
)

export default Home
