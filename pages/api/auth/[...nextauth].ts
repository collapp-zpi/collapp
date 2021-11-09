import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaExtendedAdapter } from 'shared/utils/PrismaExtendedAdapter'
import { ResetEmail } from '@collapp/email-sdk'

export default NextAuth({
  providers: [
    EmailProvider({
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
      }) {
        await fetch('https://collapp-email-microservice.herokuapp.com/')
        const mail = new ResetEmail(process.env.RABBIT_URL)
        await mail.send({
          to: email,
          subject: 'Sign in to Collap',
          secret: process.env.SECRET,
          // Context data to fill email template
          context: {
            name: `${email}`,
            link: url,
          },
        })
        mail.disconnect()
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '../../',
    error: '../../error',
    signOut: '../../',
  },
  adapter: PrismaExtendedAdapter('regular'),
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async session({ session, user }) {
      if (session) session.userId = user.id
      return session
    },
  },
})
