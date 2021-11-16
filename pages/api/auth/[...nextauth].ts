import NextAuth, { Account, Profile, User } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaExtendedAdapter } from 'shared/utils/PrismaExtendedAdapter'
import { LoginEmail } from '@collapp/email-sdk'

export default NextAuth({
  providers: [
    EmailProvider({
      async sendVerificationRequest({ identifier: email, url }) {
        await fetch('https://collapp-email-microservice.herokuapp.com/')
        const mail = new LoginEmail(process.env.RABBIT_URL)
        await mail.send({
          to: email,
          subject: 'Sign in to Collapp',
          secret: process.env.SECRET,
          context: { email, url },
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
    async signIn({ user, account, profile }) {
      const regularUser = await prisma?.regularUser.findFirst({
        where: {
          email: user.email,
        },
        include: {
          accounts: true,
        },
      })

      if (!!regularUser && !regularUser.accounts.length) {
        await prisma?.regularUser.update({
          where: {
            id: regularUser.id,
          },
          data: {
            name: user.name,
            image: user.image,
          },
        })

        await prisma?.regularAccount.create({
          data: {
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            user: {
              connect: {
                id: regularUser.id,
              },
            },
          },
        })
      }

      return true
    },
  },
})
