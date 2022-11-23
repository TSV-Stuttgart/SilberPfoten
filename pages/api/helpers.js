import getToken from '../../lib/auth/getToken'
import logger from '../../lib/logger'
import db from '../../lib/db'

export default async function handler(request, response) {
  logger.info(`api | helpers`)

  try {
    const token = await getToken(request)

    if (!token) {
      logger.info(`api | helpers | user | not authorized`)
      response.status(401).send({})
      return
    }

    logger.info(`api | helpers | db request`)

    const dbRequest = await db.query(`
      SELECT 
        lastname,
        firstname,
        array_to_string(experience_with_animal::text[], ',') as experience_with_animal,
        experience_with_animal_other,
        created_at
      FROM 
        dbo.user u
      WHERE
        status = 'USER'
      ORDER BY 
        u.lastname, u.firstname
    `, [])

    logger.info(`api | helpers | response`)

    response.status(200).json(dbRequest.rows)

    return

  } catch(e) {
    logger.info(`api | helpers | error | ${e}`)

    response.status(500).send({})
  }
}