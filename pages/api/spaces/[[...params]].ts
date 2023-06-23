import { prisma } from 'shared/utils/prismaClient'
import {
  BadRequestException,
  Body,
  createHandler,
  Delete,
  Get,
  Param,
  ParseNumberPipe,
  Patch,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@storyofams/next-api-decorators'
import { NextAuthGuard, User } from 'shared/utils/apiDecorators'
import type { RequestUser } from 'shared/utils/apiDecorators'
import { IsNotEmpty, IsOptional, NotEquals } from 'class-validator'
import {
  spaceExists,
  spaceFindExists,
  userCanEdit,
  userIsMember,
  userIsOwner,
} from 'includes/spaces/spaceRequestValidation'

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

    await spaceExists(space)

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
    await userCanEdit(await userIsMember(user.id, id))

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
    await userCanEdit(await userIsMember(user.id, id))

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

    await spaceExists(space)

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

  @Get('/:id/users')
  async getSpaceUsers(@Param('id') id: string, @User user: RequestUser) {
    await spaceFindExists(id)
    await userIsMember(user.id, id)

    return await prisma.spaceUser.findMany({
      where: {
        spaceId: id,
      },
      include: {
        user: true,
      },
    })
  }

  @Delete('/:id')
  async deleteSpace(@Param('id') id: string, @User user: RequestUser) {
    await spaceFindExists(id)
    const spaceUser = await userIsMember(user.id, id)
    await userIsOwner(spaceUser)

    return await prisma.space.delete({
      where: {
        id,
      },
    })
  }

  @Delete('/:id/user')
  async leaveSpace(@Param('id') id: string, @User user: RequestUser) {
    await spaceFindExists(id)
    const spaceUser = await userIsMember(user.id, id)

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
    await spaceFindExists(id)
    const spaceUser = await userIsMember(user.id, id)
    await userIsOwner(spaceUser)
    const spaceUserToDelete = await userIsMember(userId, id)

    if (spaceUserToDelete.isOwner) {
      throw new BadRequestException(
        'User cannot be removed because they own the space.',
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

  @Put(`/:id/permissions`)
  async updatePermissions(
    @Param('id') id: string,
    @User user: RequestUser,
    @Body() body: UpdateSpaceUserPermissions,
  ) {
    await spaceFindExists(id)
    const spaceUser = await userIsMember(user.id, id)
    await userIsOwner(spaceUser)

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
    await spaceFindExists(id)
    const spaceUser = await userIsMember(user.id, id)
    await userIsOwner(spaceUser)

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
