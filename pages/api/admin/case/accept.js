import getToken from '../../../../lib/auth/getToken'
import logger from '../../../../lib/logger'
import db from '../../../../lib/db'
import sendMail from '../../../../lib/sendMail'

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

      logger.info(`api | admin | case | accept | PATCH | send mail`)

      const templateName = 'acceptedHelpNotification'
      const subject = 'Hilfe angenommen'
      const params = {
        caseTitle: caseRequest.rows[0].subject,
        firstname: helperRequest.rows[0].firstname,
      }

      const sent = await sendMail(helperRequest.rows[0].email, subject, templateName, params)

      if (sent.statusCode === 200) {
        logger.info(`api | admin | case | accept | PATCH | send mail | sent`)
      } else {
        logger.info(`api | admin | case | accept | PATCH | send mail | error`)
      }

      response.status(200).json(dbRequest.rows[0] || {})

      return

    } catch(e) {
      logger.info(`${request.url} | ${request.method} | error | ${e}`)

      response.status(500).send({})
    }
  }
}