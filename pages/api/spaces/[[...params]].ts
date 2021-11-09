import { prisma } from 'shared/utils/prismaClient'
import {
  Body,
  createHandler,
  Get,
  NotFoundException,
  Param,
  ParseNumberPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@storyofams/next-api-decorators'
import { NextAuthGuard, RequestUser, User } from 'shared/utils/apiDecorators'
import { IsNotEmpty, IsOptional, NotEquals } from 'class-validator'
import { fetchWithPagination } from 'shared/utils/fetchWithPagination'

export class CreateSpaceDTO {
  @IsNotEmpty({ message: 'Space name is required.' })
  name!: string
  description!: string
}

export class UpdateSpaceDTO {
  @IsOptional()
  @NotEquals('', { message: 'Space name is required.' })
  name?: string
  @IsOptional()
  description?: string
  @IsOptional()
  icon?: string
}

@NextAuthGuard()
class Spaces {
  @Get()
  getSpaceList(
    @User user: RequestUser,
    @Query('limit', ParseNumberPipe({ nullable: true })) limit?: number,
    @Query('page', ParseNumberPipe({ nullable: true })) page?: number,
  ) {
    return fetchWithPagination('space', limit, page, {
      users: {
        some: {
          userId: user.id,
        },
      },
    })
  }

  @Get('/:id')
  async getSpace(@Param('id') id: string, @User user: RequestUser) {
    const space = await prisma.space.findFirst({
      include: {
        plugins: {
          select: {
            pluginId: true,
            height: true,
            width: true,
            top: true,
            left: true,
          },
        },
      },
      where: {
        id,
        users: {
          some: {
            userId: user.id,
          },
        },
      },
    })

    if (!space) {
      throw new NotFoundException('The space does not exist.')
    }

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

  @Patch('/:id')
  async updateSpace(
    @Param('id') id: string,
    @Body(ValidationPipe) body: UpdateSpaceDTO,
    @User user: RequestUser,
  ) {
    const space = await prisma.space.findFirst({
      where: {
        id,
        users: {
          some: {
            userId: user.id,
          },
        },
      },
    })

    if (!space) {
      throw new NotFoundException('The space does not exist.')
    }

    return await prisma.space.update({
      where: { id },
      data: { ...body },
    })
  }
}

export default createHandler(Spaces)
