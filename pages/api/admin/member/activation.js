import getToken from '../../../../lib/auth/getToken'
import logger from '../../../../lib/logger'
import db from '../../../../lib/db'
import sendMail from '../../../../lib/sendMail'

export default async function handler(request, response) {

  logger.info(`api | admin | member | activation`)

  try {
    logger.info(`api | admin | member | activation | get token`)
    const token = await getToken(request)

    logger.info(`api | admin | member | activation | db request`)

    const dbRequest = await db.query(
      `UPDATE user SET activated_at = 'now()', activated_from_user = $1 WHERE user_id = $2 RETURNING user_id, email, firstname, lastname`, 
      [token.user.user_id, request.query.userId]
    )

    logger.info(`api | admin | member | activation | send welcome mail`)

    if (dbRequest.rowCount > 0) {
      const to = dbRequest.rows[0].email
      const templateName = 'activationNotification'
      const subject = 'Dein Profil wurde freigeschaltet'
      const params = {
        firstname: dbRequest.rows[0].firstname,
        lastname: dbRequest.rows[0].lastname,
      }

      const sent = sendMail(to, subject, templateName, params)

      if (sent.statusCode === 200) {
        logger.info(`api | admin | member | activation | sent welcome mail`)
      } else {
        logger.info(`api | admin | member | activation | error sending email`)
      }
    }

    logger.info(`api | admin | member | activation | response`)

    response.status(200).json(dbRequest.rows[0])

    return

  } catch(e) {
    logger.info(`api | admin | member | activation | error | ${e}`)

    response.status(500).send({})
  }
}