import getToken from '../../../../lib/auth/getToken'
import logger from '../../../../lib/logger'
import db from '../../../../lib/db'

export default async function handler(request, response) {

  logger.info(`${request.url} | ${request.method}`)

  const token = await getToken(request)

  if (request.method === 'PATCH') {

    try {
      logger.info(`${request.url} | ${request.method}`)

      const dbRequest = await db.query(`
        UPDATE 
          public.case_has_user 
        SET
          rejected_at = 'now()', 
          rejected_from_user = $1,
          accepted_at = NULL,
          accepted_from_user = NULL
        WHERE 
          user_id = $2
        AND
          message_id = $3
        RETURNING 
          user_id, message_id
      `, 
        [
          token.user.user_id,
          request.query.userId,
          request.query.caseId,
        ]
      )

      response.status(200).json(dbRequest.rows[0] || {})

      return

    } catch(e) {
      logger.info(`${request.url} | ${request.method} | error | ${e}`)

      response.status(500).send({})
    }
  }
}