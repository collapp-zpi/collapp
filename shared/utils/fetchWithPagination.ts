//@ts-nocheck
import { prisma } from 'shared/utils/prismaClient'

export async function fetchWithPagination(
  entityName: string,
  _limit?: number,
  _page?: number,
  where?: { [key: string]: any },
  orderBy?: { [key: string]: any },
) {
  const limit = (_limit && Number(_limit)) || 20
  const page = (_page && Number(_page)) || 1

  const offset = (page - 1) * limit
  const entityCount = await prisma[entityName].count({
    ...(where && { where }),
  })

  const pages = Math.ceil(entityCount / limit)

  return {
    entities: await prisma[entityName].findMany({
      skip: offset,
      take: limit,
      ...(where && { where }),
      ...(orderBy && { orderBy }),
    }),
    pagination: { pages, page, limit },
  }
}
