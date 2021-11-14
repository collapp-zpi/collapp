import {
  createHandler,
  Get,
  Param,
  NotFoundException,
  BadRequestException,
  Post,
} from '@storyofams/next-api-decorators'
import { prisma } from 'shared/utils/prismaClient'
import { NextAuthGuard, RequestUser, User } from 'shared/utils/apiDecorators'

@NextAuthGuard()
class Invitations {
  async validateInvitation(id: string, user: RequestUser) {
    const invitation = await prisma.invite.findFirst({
      where: { id },
      include: {
        space: true,
      },
    })

    if (!invitation) {
      throw new NotFoundException('The invitation was not found.')
    }

    const spaceUser = await prisma.spaceUser.findFirst({
      where: { spaceId: invitation.spaceId, userId: user.id },
    })

    if (!!spaceUser) {
      throw new BadRequestException('User is already a member of this space')
    }

    if (!!invitation.expiresAt) {
      const now = new Date()
      const expiryTime = new Date(invitation.expiresAt)
      if (now > expiryTime) {
        throw new BadRequestException('Invitation is no longer active.')
      }
    }

    return invitation
  }

  @Get('/:id')
  async getInvitation(@Param('id') id: string, @User user: RequestUser) {
    return await this.validateInvitation(id, user)
  }

  @Post('/:id')
  async acceptInvitation(@Param('id') id: string, @User user: RequestUser) {
    const invitation = await this.validateInvitation(id, user)

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
}

export default createHandler(Invitations)
