import {
  createHandler,
  Get,
  Param,
  Post,
  Delete,
  Body,
  ValidationPipe,
} from '@storyofams/next-api-decorators'
import { prisma } from 'shared/utils/prismaClient'
import { NextAuthGuard, RequestUser, User } from 'shared/utils/apiDecorators'
import {
  invitationExists,
  invitationNotExpired,
  sendInviteEmail,
} from 'includes/invitations/invitationRequestValidation'
import {
  spaceFindExists,
  userCanInvite,
  userIsMember,
  userIsNotMember,
} from 'includes/spaces/spaceRequestValidation'
import { IsNotEmpty } from 'class-validator'

export class CreateInviteDTO {
  @IsNotEmpty({ message: 'Timeframe is required' })
  timeframe!: string
}

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
    await spaceFindExists(id)
    const spaceUser = await userIsMember(user.id, id)
    await userCanInvite(spaceUser)

    return await prisma.invite.findMany({
      where: {
        spaceId: id,
      },
    })
  }

  @Post('/space/:id')
  async generateInvite(
    @Param('id') id: string,
    @Body(ValidationPipe) body: CreateInviteDTO,
    @User user: RequestUser,
  ) {
    await spaceFindExists(id)

    const spaceUser = await userIsMember(user.id, id)
    await userCanInvite(spaceUser)

    let expire: number | null = 0
    switch (body.timeframe) {
      case '1':
        expire = 1
        break
      case '3':
        expire = 3
        break
      case '7':
        expire = 7
        break
      default:
        expire = null
    }

    const today = new Date()
    let expireDay = null
    if (!!expire) {
      expireDay = new Date()
      expireDay.setDate(today.getDate() + expire)
    }

    return await prisma.invite.create({
      data: {
        expiresAt: expireDay,
        space: {
          connect: {
            id: id,
          },
        },
      },
    })
  }
}

export default createHandler(Invitations)
