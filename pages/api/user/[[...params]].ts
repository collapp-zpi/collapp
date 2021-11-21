import { prisma } from 'shared/utils/prismaClient'
import {
  BadRequestException,
  Body,
  createHandler,
  Delete,
  Get,
  Param,
  Patch,
  ValidationPipe,
} from '@storyofams/next-api-decorators'
import { NextAuthGuard, RequestUser, User } from 'shared/utils/apiDecorators'
import { IsOptional, NotEquals } from 'class-validator'
import {
  spaceFindExists,
  userIsMember,
} from 'includes/spaces/spaceRequestValidation'

export class UpdateUserDTO {
  @IsOptional()
  @NotEquals('', { message: 'User name is required.' })
  name?: string
  @IsOptional()
  icon?: string
}

@NextAuthGuard()
class UserSettings {
  @Get()
  getUser(@User user: RequestUser) {
    return prisma.regularUser.findFirst({
      where: {
        id: user.id,
      },
    })
  }

  @Patch()
  async updateUser(
    @Body(ValidationPipe) body: UpdateUserDTO,
    @User user: RequestUser,
  ) {
    if (body?.icon) {
      console.log(body)
      // throw new BadRequestException('Image test')
    }

    return await prisma.regularUser.update({
      where: { id: user.id },
      data: { ...body },
    })
  }

  @Delete()
  async deleteAccount(@User user: RequestUser) {
    const isSpaceOwner = await prisma.spaceUser.findFirst({
      where: {
        userId: user.id,
        isOwner: true,
      },
    })

    if (!!isSpaceOwner) {
      throw new BadRequestException(
        'Account cannot be deleted when user owns spaces.',
      )
    }

    return await prisma.regularUser.delete({
      where: {
        id: user.id,
      },
    })
  }

  @Get('/space/:id/permissions')
  async getPermissions(@Param('id') id: string, @User user: RequestUser) {
    await spaceFindExists(id)

    return await userIsMember(user.id, id)
  }
}

export default createHandler(UserSettings)
