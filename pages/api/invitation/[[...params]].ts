import {
  createHandler,
  Get,
  Param,
  NotFoundException,
  BadRequestException,
  Post,
  UnauthorizedException,
  Delete,
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

  @Delete('/:id')
  async deleteInvitation(@Param('id') id: string, @User user: RequestUser) {
    const invitation = await prisma.invite.findFirst({
      where: { id },
    })

    if (!invitation) {
      throw new NotFoundException('The invitation was not found.')
    }

    const spaceUser = await prisma.spaceUser.findFirst({
      where: { spaceId: invitation.spaceId, userId: user.id },
    })

    if (!spaceUser) {
      throw new UnauthorizedException(
        'Users outside the space cannot remove invitations.',
      )
    }

    if (!spaceUser.canInvite && !spaceUser.isOwner) {
      throw new UnauthorizedException(
        'Only users with permissions can delete invites.',
      )
    }

    return await prisma.invite.delete({
      where: {
        id,
      },
    })
  }

  @Get('/space/:id')
  async getSpaceInvitations(@Param('id') id: string, @User user: RequestUser) {
    const space = await prisma.space.findFirst({
      where: { id },
    })

    if (!space) {
      throw new NotFoundException('The space was not found.')
    }

    const spaceUser = await prisma.spaceUser.findFirst({
      where: { spaceId: space.id, userId: user.id },
    })

    if (!spaceUser) {
      throw new UnauthorizedException(
        'Users outside the space cannot view invitations.',
      )
    }

    if (!spaceUser.canInvite && !spaceUser.isOwner) {
      throw new UnauthorizedException(
        'Only users with permissions can view invites.',
      )
    }

    return await prisma.invite.findMany({
      where: {
        spaceId: id,
      },
    })
  }
}

export default createHandler(Invitations)
