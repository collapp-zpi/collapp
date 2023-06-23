// @ts-nocheck
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { Adapter } from 'next-auth/adapters'
import { prisma } from 'shared/utils/prismaClient'

export const PrismaExtendedAdapter = (prefix: string): Adapter => {
  const newAdapter = Object.assign({}, prisma, {
    user: prisma[prefix + 'User'],
    account: prisma[prefix + 'Account'],
    session: prisma[prefix + 'Session'],
    verificationToken: prisma[prefix + 'VerificationToken'],
  })
  return PrismaAdapter(newAdapter)
}
