import { prisma } from 'shared/utils/prismaClient'
import { RequestUser } from 'shared/utils/apiDecorators'
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@storyofams/next-api-decorators'
import { SpaceUser } from '.pnpm/@prisma+client@3.3.0_prisma@3.3.0/node_modules/.prisma/client'

const findSpaceUser = async (userId: string, spaceId: string) => {
  return await prisma.spaceUser.findFirst({
    where: { spaceId, userId },
  })
}

const findSpace = async (id: string) => {
  return await prisma.space.findFirst({
    where: { id },
  })
}

export const userIsMember = async (userId: string, spaceId: string) => {
  const spaceUser = await findSpaceUser(userId, spaceId)

  if (!spaceUser) {
    throw new UnauthorizedException('You are not a member of this space.')
  }

  return spaceUser
}

export const userIsNotMember = async (userId: string, spaceId: string) => {
  const spaceUser = await findSpaceUser(userId, spaceId)

  if (!!spaceUser) {
    throw new BadRequestException('You are already a member of this space')
  }
}

export const userFindCanInvite = async (userId: string, spaceId: string) => {
  const spaceUser = await findSpaceUser(userId, spaceId)

  if (!!spaceUser) userCanInvite(spaceUser)
}

export const userCanInvite = async (spaceUser: SpaceUser) => {
  if (!spaceUser.canInvite && !spaceUser.isOwner) {
    throw new UnauthorizedException(
      'Only user with invite permission can manage invitations.',
    )
  }
}

export const spaceExists = async (id: string) => {
  const space = await findSpace(id)

  if (!space) {
    throw new NotFoundException('The space was not found.')
  }

  return space
}
