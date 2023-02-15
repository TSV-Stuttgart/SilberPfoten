import React from 'react'
import db from '../lib/db'
import logger from '../lib/logger'
import getToken from '../lib/auth/getToken'

export async function getServerSideProps(context) {
  logger.info(`signout`)
  
  try {
    logger.info(`signout | get token`)

    const token = await getToken(context.req)

    if (token?.user?.user_id) {
      logger.info(`signout | delete session in database`)
      const dbRequest = await db.query(`DELETE FROM public.session WHERE user_id = $1 RETURNING uuid`, [token.user.user_id])
      logger.info(`signout | delete session in database | deleted | ${dbRequest.rowCount}`)
    }

    logger.info(`signout | cookie | invalidate`)
    
    context.res.setHeader('set-cookie',`session=deleted; SameSite=Lax; HttpOnly; Path=/; Expires=${new Date('1970-01-01').toUTCString()}`)

    return {
      redirect: {
        destination: `/signin`,
        statusCode: 302,
      },
    }

  } catch(e) {
    logger.info(`public | event | error | ${e}`)

    return {
      props: {}
    }
  }
}

export default function SignOut() {
  
  return <></>
}