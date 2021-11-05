// @ts-nocheck
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from 'shared/utils/prismaClient'

export const PrismaExtendedAdapter = (prefix: string) => {
  const newAdapter = Object.assign({}, prisma, {
    user: prisma[prefix + 'User'],
    account: prisma[prefix + 'Account'],
    session: prisma[prefix + 'Session'],
    verificationToken: prisma[prefix + 'VerificationToken'],
  })
  return PrismaAdapter(newAdapter)
}
