import {
  createHandler,
  Get,
  Param,
  Post,
  Delete,
  Body,
} from '@storyofams/next-api-decorators'
import { prisma } from 'shared/utils/prismaClient'
import { NextAuthGuard, RequestUser, User } from 'shared/utils/apiDecorators'
import {
  invitationExists,
  invitationNotExpired,
  sendInviteEmail,
} from 'includes/invitations/invitationRequestValidation'
import {
  spaceExists,
  userCanInvite,
  userIsMember,
  userIsNotMember,
} from 'includes/spaces/spaceRequestValidation'

@NextAuthGuard()
class Invitations {
  @Get('/:id')
  async getInvitation(@Param('id') id: string, @User user: RequestUser) {
    const invitation = await invitationExists(id)
    await userIsNotMember(user.id, invitation.spaceId)
    await invitationNotExpired(invitation)

    return invitation
  }

  @Post('/:id')
  async acceptInvitation(@Param('id') id: string, @User user: RequestUser) {
    const invitation = await invitationExists(id)
    await userIsNotMember(user.id, invitation.spaceId)
    await invitationNotExpired(invitation)

    return await prisma.spaceUser.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        space: {
          connect: {
            id: invitation.spaceId,
          },
        },
      },
    })
  }

  @Post('/:id/send')
  async sendInvitation(
    @Param('id') id: string,
    @User user: RequestUser,
    @Body() body: { email: string },
  ) {
    const invitation = await invitationExists(id)
    const spaceUser = await userIsMember(user.id, invitation.spaceId)
    await userCanInvite(spaceUser)
    await invitationNotExpired(invitation)
    await sendInviteEmail(
      body.email,
      user.name ? user.name : 'Collapp user',
      invitation.id,
      invitation.space.name,
    )

    return invitation
  }

  @Delete('/:id')
  async deleteInvitation(@Param('id') id: string, @User user: RequestUser) {
    const invitation = await invitationExists(id)
    const spaceUser = await userIsMember(user.id, invitation.spaceId)
    await userCanInvite(spaceUser)

    return await prisma.invite.delete({
      where: {
        id,
      },
    })
  }

  @Get('/space/:id')
  async getSpaceInvitations(@Param('id') id: string, @User user: RequestUser) {
    await spaceExists(id)
    const spaceUser = await userIsMember(user.id, id)
    await userCanInvite(spaceUser)

    return await prisma.invite.findMany({
      where: {
        spaceId: id,
      },
    })
  }
}

export default createHandler(Invitations)
