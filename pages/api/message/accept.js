import getToken from '../../../lib/auth/getToken'
import logger from '../../../lib/logger'
import db from '../../../lib/db'
import { sendToQueue } from '../../../lib/queue'
import putAudit from '../../../database/queries/audit/putAudit'

export default async function handler(request, response) {

  logger.info(`api | message | accept`)

  try {
    if (request.method === 'DELETE') {
      logger.info(`api | message | accept | DELETE | get token`)
      const token = await getToken(request)

      logger.info(`api | message | accept | DELETE | db request`)

      const dbRequest = await db.query(
        `DELETE FROM public.case_has_user WHERE user_id = $1 AND message_id = $2 RETURNING user_id, message_id`, 
        [token.user.user_id, request.query.messageId]
      )

      putAudit('deleteCaseHelpOffer', {user_id: token.user.user_id, message_id: request.query.messageId})

      logger.info(`api | message | accept | DELETE | response`)

      response.status(200).json(dbRequest.rows[0])

      return
    }

    if (request.method === 'POST') {
      logger.info(`api | message | accept | POST | get token`)
      const token = await getToken(request)

      logger.info(`api | message | accept | POST | db getCaseRequest`)

      const dbGetCaseRequest = await db.query(
        `SELECT subject FROM public.message WHERE message_id = $1 AND status = 'OPEN'`, 
        [request.query.messageId]
      )

      if (dbGetCaseRequest.rowCount === 0) {
        response.status(404).send({})

        logger.info(`api | message | accept | POST | db request | not found`)

        return
      }

      logger.info(`api | message | accept | POST | db request`)

      const dbRequest = await db.query(
        `INSERT INTO public.case_has_user (user_id, message_id) VALUES ($1,$2) RETURNING user_id, message_id`, 
        [token.user.user_id, request.query.messageId]
      )

      putAudit('addCaseHelpOffer', {user_id: token.user.user_id, message_id: request.query.messageId})

      logger.info(`api | message | accept | POST | send mail to queue`)

      const to = 'info@silberpfoten.de'
      const templateName = 'acceptedCaseNotification'
      const subject = 'Fallübernahme'
      const params = {
        caseTitle: dbGetCaseRequest.rows[0].subject,
        firstname: token.user.firstname,
        lastname : token.user.lastname,
      }

      const data = {
        email: to,
        emailSubject: subject,
        templateName: templateName,
        params: params,
      }

      await sendToQueue('MAIN', data)

      logger.info(`api | message | accept | POST | response`)

      response.status(200).json(dbRequest.rows[0])

      return
    }

  } catch(e) {
    logger.info(`api | message | accept | POST | error | ${e}`)

    response.status(500).send({})
  }
}