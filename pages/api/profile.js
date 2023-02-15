import getToken from '../../lib/auth/getToken'
import logger from '../../lib/logger'
import db from '../../lib/db'

export default async function handler(request, response) {

  logger.info(`api | profile`)

  try {
    const token = await getToken(request)

    if (!token) {
      logger.info(`api | profile | user | not authorized`)
      response.status(401).send({})
      return
    }

    console.log(token)
    console.log(request.body)

    const {
      phone,
      birthdate,
      job,
      support_activity,
      experience_with_animal,
      experience_with_animal_other,
    } = request.body

    logger.info(`api | profile | db request`)

    const dbRequest = await db.query(`
      UPDATE
        public.user 
      SET
        birthdate = $1,
        phone = $2,
        job = $3,
        experience_with_animal = $4,
        experience_with_animal_other = $5,
        support_activity = $6,
        updated_at = 'now()'
      WHERE
        user_id = $7
      RETURNING user_id
    `, [
        birthdate,
        phone,
        job,
        experience_with_animal,
        experience_with_animal_other,
        support_activity,
        token.user.user_id,
      ]
    )

    logger.info(`api | profile | response`)

    response.status(dbRequest.rowCount > 0 ? 200 : 304).json({})

    return

  } catch(e) {
    logger.info(`api | profile | error | ${e}`)

    response.status(500).send({})
  }
}