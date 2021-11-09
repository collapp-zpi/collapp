import { prisma } from 'shared/utils/prismaClient'
import {
  createHandler,
  Get,
  NotFoundException,
  Param,
  ParseNumberPipe,
  Query,
} from '@storyofams/next-api-decorators'
import { NextAuthGuard } from 'shared/utils/apiDecorators'
import { fetchWithPagination } from 'shared/utils/fetchWithPagination'

@NextAuthGuard()
class Plugins {
  @Get()
  getPluginsList(
    @Query('limit', ParseNumberPipe({ nullable: true })) limit?: number,
    @Query('name') name?: string,
  ) {
    return fetchWithPagination('publishedPlugin', limit, 1, {
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
    })
  }

  @Get('/space/:id')
  async getPluginsInSpace(@Param('id') id: string) {
    return await prisma.spacePlugin.findMany({
      where: { spaceId: id },
      include: {
        plugin: {
          select: {
            name: true,
            icon: true,
            minWidth: true,
            maxWidth: true,
            minHeight: true,
            maxHeight: true,
          },
        },
      },
    })
  }

  @Get('/:id')
  async getPlugins(@Param('id') id: string) {
    const plugins = await prisma.publishedPlugin.findFirst({
      where: { id },
    })

    if (!plugins) {
      throw new NotFoundException('The plugin does not exist.')
    }

    return plugins
  }
}

export default createHandler(Plugins)
