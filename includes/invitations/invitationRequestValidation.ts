import { prisma } from 'shared/utils/prismaClient'
import {
  BadRequestException,
  NotFoundException,
} from '@storyofams/next-api-decorators'
import { Invite } from '.pnpm/@prisma+client@3.3.0_prisma@3.3.0/node_modules/.prisma/client'
import { InviteEmail } from '@collapp/email-sdk'

const findInvite = async (id: string) => {
  return await prisma.invite.findFirst({
    where: { id },
    include: {
      space: true,
    },
  })
}

export const invitationExists = async (id: string) => {
  const invitation = await findInvite(id)

  if (!invitation) {
    throw new NotFoundException('The invitation was not found.')
  }

  return invitation
}

export const invitationFindNotExpired = async (id: string) => {
  const invitation = await findInvite(id)

  if (!!invitation) invitationNotExpired(invitation)
}

export const invitationNotExpired = async (invitation: Invite) => {
  if (!!invitation.expiresAt) {
    const now = new Date()
    const expiryTime = new Date(invitation.expiresAt)
    if (now > expiryTime) {
      throw new BadRequestException('Invitation is no longer active.')
    }
  }
}

export const sendInviteEmail = async (
  to: string,
  from: string,
  inviteId: string,
  spaceName: string,
) => {
  await fetch('https://collapp-email-microservice.herokuapp.com/')
  const mail = new InviteEmail(process.env.RABBIT_URL)
  await mail.send({
    to,
    subject: `${from} invites you to space ${spaceName}`,
    secret: process.env.SECRET,
    context: {
      from,
      space: spaceName,
      url: `${process.env.BASE_URL}/invitations/${inviteId}`,
    },
  })
  mail.disconnect()
}
