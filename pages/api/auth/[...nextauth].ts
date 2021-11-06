import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaExtendedAdapter } from 'shared/utils/PrismaExtendedAdapter'

export default NextAuth({
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SMTP_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
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
    verifyRequest: '../../',
    newUser: '../../',
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
