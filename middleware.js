import {NextResponse} from 'next/server'
import logger from './lib/logger'

export async function middleware(request) {
  logger.info(`middleware`)
  
  logger.info(`middleware | fetch session | ${process.env.NEXT_PUBLIC_HOST}/api/auth/session`)

  const sessionRequest = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/auth/session`, {
    headers: {
      Cookie: `session=${request.cookies.get('session')}`
    }
  })

  const status = sessionRequest.status
  const session = await sessionRequest.json()

  logger.info(`${session.user.session_id} | middleware | fetch session | ${process.env.NEXT_PUBLIC_HOST}/api/auth/session | status | ${status}`)
  logger.info(`${session.user.session_id} | middleware | fetch session | ${process.env.NEXT_PUBLIC_HOST}/api/auth/session | data | object values | ${Object.values(session).length}`)

  if (status !== 200 || Object.values(session).length <= 0) {
    logger.info(`${session.user.session_id} | middleware | fetch session | ${process.env.NEXT_PUBLIC_HOST}/api/auth/session | not authenticated | redirect`)

    return NextResponse.redirect(new URL('/signin', request.url))
  }

  logger.info(`${session.user.session_id} | middleware | fetch session | ${process.env.NEXT_PUBLIC_HOST}/api/auth/session | authenticated | do nothing`)
}

export const config = {
  matcher: [
    '/api/:path*',
    '/members/:path*',
    '/member/:path*',
  ],
}