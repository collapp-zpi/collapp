import { prisma } from 'shared/utils/prismaClient'
import {
  BadRequestException,
  Body,
  createHandler,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseNumberPipe,
  Patch,
  Post,
  Put,
  Query,
  UnauthorizedException,
  ValidationPipe,
} from '@storyofams/next-api-decorators'
import { NextAuthGuard, RequestUser, User } from 'shared/utils/apiDecorators'
import { IsNotEmpty, IsOptional, NotEquals } from 'class-validator'

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

type UpdateSpacePluginsItem = {
  id: string
  left: number
  top: number
  height: number
  width: number
}

type UpdateSpaceUserItem = {
  canEdit: boolean
  canInvite: boolean
}

type UpdateSpaceUserPermissions = {
  [key: string]: UpdateSpaceUserItem
}

export class CreateInviteDTO {
  @IsNotEmpty({ message: 'Timeframe is required' })
  timeframe!: string
}

@NextAuthGuard()
class Spaces {
  @Get()
  async getSpaceList(
    @User user: RequestUser,
    @Query('limit', ParseNumberPipe({ nullable: true })) _limit?: number,
    @Query('page', ParseNumberPipe({ nullable: true })) _page?: number,
  ) {
    const limit = (_limit && Number(_limit)) || 20
    const page = (_page && Number(_page)) || 1

    const offset = (page - 1) * limit
    const entityCount = await prisma.space.count({
      where: {
        users: {
          some: {
            userId: user.id,
          },
        },
      },
    })
    const pages = Math.ceil(entityCount / limit)

    return {
      entities: await prisma.space.findMany({
        skip: offset,
        take: limit,
        include: {
          users: {
            take: 3,
            where: {
              userId: {
                not: user.id,
              },
            },
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        where: {
          users: {
            some: {
              userId: user.id,
            },
          },
        },
      }),
      pagination: { pages, page, limit },
    }
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
            plugin: {
              select: {
                isDeleted: true,
              },
            },
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

  @Put('/:id/plugins')
  async updatePlugins(
    @Param('id') id: string,
    @Body() body: UpdateSpacePluginsItem[],
    @User user: RequestUser,
  ) {
    const space = await prisma.space.findFirst({
      include: {
        plugins: true,
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

    const newPlugins = {} as { [key: string]: UpdateSpacePluginsItem }
    for (const item of body) {
      newPlugins[item.id] = item
    }
    const created = []
    const updated = []
    const deleted = []

    for (const plugin of space.plugins) {
      const newPlugin = newPlugins?.[plugin.pluginId]
      // delete case
      if (!newPlugin) {
        deleted.push({ pluginId: plugin.pluginId })
        continue
      }
      // modify case
      if (
        newPlugin.left !== plugin.left ||
        newPlugin.top !== plugin.top ||
        newPlugin.width !== plugin.width ||
        newPlugin.height !== plugin.height
      ) {
        updated.push({
          where: { pluginId: plugin.pluginId },
          data: {
            left: newPlugin.left,
            top: newPlugin.top,
            width: newPlugin.width,
            height: newPlugin.height,
          },
        })
      }
      delete newPlugins[plugin.pluginId]
    }

    for (const key in newPlugins) {
      const { id, left, top, width, height } = newPlugins[key]

      created.push({ pluginId: id, left, top, width, height })
    }

    return await prisma.space.update({
      where: { id },
      data: {
        plugins: {
          deleteMany: deleted,
          create: created,
          updateMany: updated,
        },
      },
    })
  }

  @Post('/:id/invite')
  async generateInvite(
    @Param('id') id: string,
    @Body(ValidationPipe) body: CreateInviteDTO,
    @User user: RequestUser,
  ) {
    const space = await prisma.space.findFirst({
      where: {
        id,
      },
    })

    if (!space) {
      throw new NotFoundException('The space does not exist.')
    }

    const spaceUser = await prisma.spaceUser.findFirst({
      where: {
        spaceId: id,
        userId: user.id,
      },
    })

    if (!spaceUser) {
      throw new UnauthorizedException(
        'Users outside the space cannot generate invitations.',
      )
    }
    if (!spaceUser.canInvite && !spaceUser.isOwner) {
      throw new UnauthorizedException(
        'Only users with invite permisions can generate invitations.',
      )
    }

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

    const invite = await prisma.invite.create({
      data: {
        expiresAt: expireDay,
        space: {
          connect: {
            id: id,
          },
        },
      },
    })

    return invite
  }

  @Get('/:id/users')
  async getSpaceUsers(@Param('id') id: string, @User user: RequestUser) {
    const space = await prisma.space.findFirst({
      where: {
        id: id,
      },
    })

    if (!space) {
      throw new NotFoundException('The space does not exist.')
    }

    const spaceUser = await prisma.spaceUser.findFirst({
      where: {
        spaceId: id,
        userId: user.id,
      },
    })

    if (!spaceUser) {
      throw new UnauthorizedException(
        'Users outside the space cannot view space members.',
      )
    }

    return await prisma.spaceUser.findMany({
      where: {
        spaceId: id,
      },
      include: {
        user: true,
      },
    })
  }

  @Get('/:id/permissions')
  async getPermissions(@Param('id') id: string, @User user: RequestUser) {
    const space = await prisma.space.findFirst({
      where: {
        id: id,
      },
    })

    if (!space) {
      throw new NotFoundException('The space does not exist.')
    }

    const spaceUser = await prisma.spaceUser.findFirst({
      where: {
        spaceId: id,
        userId: user.id,
      },
      select: {
        isOwner: true,
        canEdit: true,
        canInvite: true,
      },
    })

    if (!spaceUser) {
      throw new UnauthorizedException('User is not a member of this space.')
    }

    return spaceUser
  }

  @Delete('/:id')
  async deleteSpace(@Param('id') id: string, @User user: RequestUser) {
    const space = await prisma.space.findFirst({
      where: {
        id: id,
      },
    })

    if (!space) {
      throw new NotFoundException('The space does not exist.')
    }

    const spaceUser = await prisma.spaceUser.findFirst({
      where: {
        spaceId: id,
        userId: user.id,
      },
    })

    if (!spaceUser) {
      throw new UnauthorizedException('Users is not a member of this space.')
    }

    if (!spaceUser.isOwner) {
      throw new UnauthorizedException('Only space owners can delete spaces.')
    }

    return await prisma.space.delete({
      where: {
        id,
      },
    })
  }

  @Delete('/:id/user')
  async leaveSpace(@Param('id') id: string, @User user: RequestUser) {
    const space = await prisma.space.findFirst({
      where: {
        id: id,
      },
    })

    if (!space) {
      throw new NotFoundException('The space does not exist.')
    }

    const spaceUser = await prisma.spaceUser.findFirst({
      where: {
        spaceId: id,
        userId: user.id,
      },
    })

    if (!spaceUser) {
      throw new UnauthorizedException('Users is not a member of this space.')
    }

    if (spaceUser.isOwner) {
      throw new BadRequestException('Space owner cannot leave their spaces.')
    }

    return await prisma.spaceUser.delete({
      where: {
        userId_spaceId: {
          userId: user.id,
          spaceId: id,
        },
      },
    })
  }

  @Delete('/:id/user/:userId')
  async deleteSpaceUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @User user: RequestUser,
  ) {
    const space = await prisma.space.findFirst({
      where: {
        id: id,
      },
    })

    if (!space) {
      throw new NotFoundException('The space does not exist.')
    }

    const spaceUser = await prisma.spaceUser.findFirst({
      where: {
        spaceId: id,
        userId: user.id,
      },
    })

    if (!spaceUser) {
      throw new UnauthorizedException(
        'Users outside the space cannot remove users.',
      )
    }

    if (!spaceUser.canInvite && !spaceUser.isOwner) {
      throw new UnauthorizedException(
        'Only users with invite permisions can remove users.',
      )
    }

    const spaceUserToDelete = await prisma.spaceUser.findFirst({
      where: { userId: userId },
    })

    if (!spaceUserToDelete) {
      throw new BadRequestException(
        'Requested user to remove is not a member of this space.',
      )
    }

    if (spaceUserToDelete.isOwner) {
      throw new BadRequestException(
        'Requested user to remove is an owner of the space.',
      )
    }

    return await prisma.spaceUser.delete({
      where: {
        userId_spaceId: {
          userId: userId,
          spaceId: id,
        },
      },
    })
  }

  @Patch(`/:id/permissions`)
  async updatePermissions(
    @Param('id') id: string,
    @User user: RequestUser,
    @Body() body: UpdateSpaceUserPermissions,
  ) {
    const space = await prisma.space.findFirst({
      where: { id },
    })

    if (!space) {
      throw new NotFoundException('The space does not exist.')
    }

    const spaceUser = await prisma.spaceUser.findFirst({
      where: {
        spaceId: id,
        userId: user.id,
      },
    })

    if (!spaceUser) {
      throw new UnauthorizedException(
        'Users outside the space cannot update permissions.',
      )
    }

    if (!spaceUser.isOwner) {
      throw new UnauthorizedException(
        'Only space owners can update persmissions.',
      )
    }

    const update = Object.entries(body).map(([userId, data]) => ({
      where: { userId },
      data,
    }))

    return await prisma.space.update({
      where: { id },
      data: {
        users: {
          updateMany: update,
        },
      },
    })
  }

  @Patch('/:id/transfer-ownership')
  async transferOwnerShip(
    @Param('id') id: string,
    @User user: RequestUser,
    @Body() body: string,
  ) {
    const space = await prisma.space.findFirst({
      where: { id },
    })

    if (!space) {
      throw new NotFoundException('The space does not exist.')
    }

    const spaceUser = await prisma.spaceUser.findFirst({
      where: {
        spaceId: id,
        userId: user.id,
      },
    })

    if (!spaceUser) {
      throw new UnauthorizedException(
        'Users outside the space cannot transfer ownership.',
      )
    }

    if (!spaceUser.isOwner) {
      throw new UnauthorizedException(
        'Only space owner can transfer ownership.',
      )
    }

    if (user.id === body) {
      throw new BadRequestException(
        'Cannot transfer ownership to the same user.',
      )
    }

    const update = [
      {
        where: { userId: spaceUser.userId },
        data: {
          canEdit: true,
          canInvite: true,
          isOwner: false,
        },
      },
      {
        where: { userId: body },
        data: {
          canEdit: true,
          canInvite: true,
          isOwner: true,
        },
      },
    ]

    return await prisma.space.update({
      where: { id },
      data: {
        users: {
          updateMany: update,
        },
      },
    })
  }
}

export default createHandler(Spaces)
