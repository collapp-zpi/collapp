import { prisma } from 'shared/utils/prismaClient'
import {
  BadRequestException,
  NotFoundException,
} from '@storyofams/next-api-decorators'
import { Invite } from '@prisma/client'
import { Resend } from 'resend'
import { InviteTemplate } from 'shared/emailTemplates/invite'

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

const resend = new Resend(process.env.EMAIL_KEY)

export const sendInviteEmail = async (
  to: string,
  from: string,
  inviteId: string,
  spaceName: string,
) => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: 'Invitation in Collapp',
    react: InviteTemplate({
      from,
      space: spaceName,
      redirect: `${process.env.BASE_URL}/invitations/${inviteId}`,
    }),
  })
}
