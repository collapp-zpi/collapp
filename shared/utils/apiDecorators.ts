import {
  createMiddlewareDecorator,
  createParamDecorator,
  NextFunction,
  UnauthorizedException,
} from '@storyofams/next-api-decorators'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

declare module 'next' {
  interface NextApiRequest {
    user?: RequestUser
  }
}

export interface RequestUser {
  id: string
  name: string | undefined
  email: string | undefined
  image: string | undefined
}

export const NextAuthGuard = createMiddlewareDecorator(
  async (req: NextApiRequest, res: NextApiResponse, next: NextFunction) => {
    const session = await getSession({ req })
    if (!session) {
      throw new UnauthorizedException()
    }

    req.user = {
      id: session.userId as string,
      name: session.user?.name || undefined,
      email: session.user?.email || undefined,
      image: session.user?.image || undefined,
    }
    next()
  },
)

export const User = createParamDecorator<RequestUser>(
  (req) => req.user as RequestUser,
)()
