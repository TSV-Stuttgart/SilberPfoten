import getToken from '../../../lib/auth/getToken'
import logger from '../../../lib/logger'
import db from '../../../lib/db'
import sendMail from '../../../lib/sendMail'

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

      logger.info(`api | message | accept | DELETE | response`)

      response.status(200).json(dbRequest.rows[0])

      return
    }

    if (request.method === 'POST') {
      logger.info(`api | message | accept | POST | get token`)
      const token = await getToken(request)

      logger.info(`api | message | accept | POST | db request`)

      const dbRequest = await db.query(
        `INSERT INTO public.case_has_user (user_id, message_id) VALUES ($1,$2) RETURNING user_id, message_id`, 
        [token.user.user_id, request.query.messageId]
      )

      logger.info(`api | signup | send mail`)

      const to = 'scoletti@stigits.com'
      const templateName = 'acceptedCaseNotification'
      const subject = 'Fallübernahme'
      const params = {
        firstname: token.user.firstname,
        lastname : token.user.lastname,
      }

      const sent = sendMail(to, subject, templateName, params)

      if (sent.statusCode === 200) {
        logger.info(`api | signup | send mail | sent`)

        response.status(200).json({
          status: 200,
          token,
        })

        return
      } else {
        logger.info(`api | signup | send mail | error`)
      }

      logger.info(`api | message | accept | POST | response`)

      response.status(200).json(dbRequest.rows[0])

      return
    }

  } catch(e) {
    logger.info(`api | message | accept | POST | error | ${e}`)

    response.status(500).send({})
  }
}