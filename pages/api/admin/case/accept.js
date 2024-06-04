import getToken from '../../../../lib/auth/getToken'
import logger from '../../../../lib/logger'
import db from '../../../../lib/db'
import { sendToQueue } from '../../../../lib/queue'
import putAudit from '../../../../database/queries/audit/putAudit'

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
          accepted_at = 'now()', 
          accepted_from_user = $1,
          rejected_at = NULL, 
          rejected_from_user = NULL
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

      const helperRequest = await db.query(`
        SELECT
          firstname, email
        FROM
          public.user
        WHERE 
          user_id = $1
      `, 
        [
          request.query.userId,
        ]
      )

      const caseRequest = await db.query(`
        SELECT
          subject
        FROM
          public.message
        WHERE 
          message_id = $1
      `, 
        [
          request.query.caseId,
        ]
      )

      logger.info(`api | admin | case | accept | PATCH | send mail to queue`)

      const templateName = 'acceptedHelpNotification'
      const subject = 'Hilfe angenommen'
      const params = {
        caseTitle: caseRequest.rows[0].subject,
        firstname: helperRequest.rows[0].firstname,
      }

      const data = {
        email: helperRequest.rows[0].email,
        emailSubject: subject,
        templateName: templateName,
        params: params,
      }

      putAudit('acceptCaseHelpOffer', {user_id: request.query.userId, message_id: request.query.caseId, admin_id: token.user.user_id})

      await sendToQueue('MAIN', data)

      response.status(200).json(dbRequest.rows[0] || {})

      return

    } catch(e) {
      logger.info(`${request.url} | ${request.method} | error | ${e}`)

      response.status(500).send({})
    }
  }
}