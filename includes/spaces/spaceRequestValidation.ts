import { prisma } from 'shared/utils/prismaClient'
import { RequestUser } from 'shared/utils/apiDecorators'
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@storyofams/next-api-decorators'
import {
  Space,
  SpaceUser,
} from '.pnpm/@prisma+client@3.3.0_prisma@3.3.0/node_modules/.prisma/client'

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
    throw new UnauthorizedException('This user is not a member of this space.')
  }

  return spaceUser
}

export const userIsNotMember = async (userId: string, spaceId: string) => {
  const spaceUser = await findSpaceUser(userId, spaceId)

  if (!!spaceUser) {
    throw new BadRequestException('This user is already a member of this space')
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

export const userFindCanEdit = async (userId: string, spaceId: string) => {
  const spaceUser = await findSpaceUser(userId, spaceId)

  if (!!spaceUser) userCanEdit(spaceUser)
}

export const userCanEdit = async (spaceUser: SpaceUser) => {
  if (!spaceUser.canEdit && !spaceUser.isOwner) {
    throw new UnauthorizedException(
      'Only user with edit permission can adjust the space.',
    )
  }
}

export const userFindIsOwner = async (userId: string, spaceId: string) => {
  const spaceUser = await findSpaceUser(userId, spaceId)

  if (!!spaceUser) userIsOwner(spaceUser)
}

export const userIsOwner = async (spaceUser: SpaceUser) => {
  if (!spaceUser.isOwner) {
    throw new UnauthorizedException('Only space owner can perform this action.')
  }
}

export const spaceFindExists = async (id: string) => {
  const space = await findSpace(id)

  await spaceExists(space)

  return space
}

export const spaceExists = async (space: Space | null) => {
  if (!space) {
    throw new NotFoundException('The space was not found.')
  }
}
