import { prisma } from 'shared/utils/prismaClient'
import {
  Body,
  createHandler,
  Get,
  NotFoundException,
  Param,
  ParseNumberPipe,
  Post,
  Query,
  ValidationPipe,
} from '@storyofams/next-api-decorators'
import { NextAuthGuard, RequestUser, User } from 'shared/utils/apiDecorators'
import { IsNotEmpty } from 'class-validator'
import { fetchWithPagination } from 'shared/utils/fetchWithPagination'

export class CreateSpaceDTO {
  @IsNotEmpty({ message: 'Space name is required.' })
  name!: string
  description!: string
}

@NextAuthGuard()
class Spaces {
  @Get()
  getSpaceList(
    @User user: RequestUser,
    @Query('limit', ParseNumberPipe({ nullable: true })) limit?: number,
    @Query('page', ParseNumberPipe({ nullable: true })) page?: number,
  ) {
    return fetchWithPagination(
      'space',
      limit,
      page /*, {
      authorId: user.id, // TODO: fetch only spaces where is a member
    }*/,
    )
  }

  @Get('/:id')
  async getSpace(@Param('id') id: string, @User user: RequestUser) {
    const space = await prisma.space.findFirst({
      where: { id },
    })

    if (!space) {
      throw new NotFoundException('The space does not exist.')
    }

    // TODO: if is a member

    return space
  }

  @Post()
  createSpace(
    @Body(ValidationPipe) body: CreateSpaceDTO,
    @User user: RequestUser,
  ) {
    return prisma.space.create({
      data: {
        name: body.name,
        description: body.description,
        icon: '',
        users: {
          create: [
            {
              isOwner: true,
              canEdit: true,
              canInvite: true,
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          ],
        },
      },
    })
  }
}

export default createHandler(Spaces)
