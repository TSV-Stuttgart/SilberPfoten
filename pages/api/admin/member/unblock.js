import getToken from '../../../../lib/auth/getToken'
import logger from '../../../../lib/logger'
import db from '../../../../lib/db'

export default async function handler(request, response) {

  logger.info(`api | admin | member | unblock`)

  try {
    logger.info(`api | admin | member | unblock | get token`)
    const token = await getToken(request)

    logger.info(`api | admin | member | unblock | db request`)

    const dbRequest = await db.query(
      `UPDATE dbo.user SET blocked_at = NULL, blocked_from_user = NULL, activated_at = 'now()', activated_from_user = $1, updated_at = 'now()' WHERE user_id = $2`, 
      [token.user.user_id, request.query.userId]
    )

    logger.info(`api | admin | member | unblock | response`)

    response.status(200).json(dbRequest.rows[0])

    return

  } catch(e) {
    logger.info(`api | admin | member | unblock | error | ${e}`)

    response.status(500).send({})
  }
}