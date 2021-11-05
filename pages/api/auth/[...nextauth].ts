import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaExtendedAdapter } from 'shared/utils/PrismaExtendedAdapter'

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
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
