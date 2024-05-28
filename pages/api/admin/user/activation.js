import getToken from '../../../../lib/auth/getToken'
import logger from '../../../../lib/logger'
import db from '../../../../lib/db'
import { sendToQueue } from '../../../../lib/queue'

export default async function handler(request, response) {

  logger.info(`api | admin | member | activation`)

  try {
    logger.info(`api | admin | member | activation | get token`)
    const token = await getToken(request)

    logger.info(`api | admin | member | activation | db request`)

    const dbRequest = await db.query(
      `UPDATE public.user SET activated_at = 'now()', activated_from_user = $1 WHERE user_id = $2 RETURNING user_id, email, firstname, lastname`, 
      [token.user.user_id, request.query.userId]
    )

    logger.info(`api | admin | member | activation | send welcome mail to queue`)

    if (dbRequest.rowCount > 0) {
      const templateName = 'activationNotification'
      const subject = 'Dein Profil wurde freigeschaltet'
      const params = {
        firstname: dbRequest.rows[0].firstname,
        lastname: dbRequest.rows[0].lastname,
      }

      const data = {
        email: dbRequest.rows[0].email,
        emailSubject: subject,
        templateName: templateName,
        params: params,
      }

      await sendToQueue('MAIN', data)
    }

    logger.info(`api | admin | member | activation | response`)

    response.status(200).json(dbRequest.rows[0])

    return

  } catch(e) {
    logger.info(`api | admin | member | activation | error | ${e}`)

    response.status(500).send({})
  }
}