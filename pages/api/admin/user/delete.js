import getToken from '../../../../lib/auth/getToken'
import logger from '../../../../lib/logger'
import db from '../../../../lib/db'
import putAudit from '../../../../database/queries/audit/putAudit'

export default async function handler(request, response) {

  logger.info(`api | admin | member | delete`)

  try {
    logger.info(`api | admin | member | delete | get token`)
    const token = await getToken(request)

    if (token.user.status !== 'ADMIN') {

      response.status(401).json({})

      return
    }

    logger.info(`api | admin | member | delete | db request`)

    const dbRequest = await db.query(`DELETE FROM public.user WHERE user_id = $1`, [request.query.userId])

    putAudit('deleteAccountByAdmin', {user_id: request.query.userId, admin_id: token.user.user_id})

    await db.query(`DELETE FROM public.session WHERE user_id = $1`, [request.query.userId])

    logger.info(`api | admin | member | delete | response`)

    response.status(200).json(dbRequest.rows[0])

    return

  } catch(e) {
    logger.info(`api | admin | member | delete | error | ${e}`)

    response.status(500).send({})
  }
}