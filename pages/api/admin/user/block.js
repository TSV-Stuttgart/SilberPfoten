import getToken from '../../../../lib/auth/getToken'
import logger from '../../../../lib/logger'
import db from '../../../../lib/db'

export default async function handler(request, response) {

  logger.info(`api | admin | member | blocked`)

  try {
    logger.info(`api | admin | member | blocked | get token`)
    const token = await getToken(request)

    logger.info(`api | admin | member | blocked | db request`)

    const dbRequest = await db.query(
      `UPDATE public.user SET blocked_at = 'now()', blocked_from_user = $1, activated_at = NULL, activated_from_user = NULL, updated_at = 'now()' WHERE user_id = $2`, 
      [token.user.user_id, request.query.userId]
    )

    logger.info(`api | admin | member | blocked | response`)

    response.status(200).json(dbRequest.rows[0])

    return

  } catch(e) {
    logger.info(`api | admin | member | blocked | error | ${e}`)

    response.status(500).send({})
  }
}