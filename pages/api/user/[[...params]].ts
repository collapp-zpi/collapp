import { prisma } from 'shared/utils/prismaClient'
import {
  Body,
  createHandler,
  Get,
  Patch,
  ValidationPipe,
} from '@storyofams/next-api-decorators'
import { NextAuthGuard, RequestUser, User } from 'shared/utils/apiDecorators'
import { IsOptional, NotEquals } from 'class-validator'

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
    return prisma.developerUser.findFirst({
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

    return await prisma.developerUser.update({
      where: { id: user.id },
      data: { ...body },
    })
  }
}

export default createHandler(UserSettings)
