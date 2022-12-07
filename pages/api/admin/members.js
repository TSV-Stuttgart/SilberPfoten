import getToken from '../../../lib/auth/getToken'
import logger from '../../../lib/logger'
import db from '../../../lib/db'

export default async function handler(request, response) {
  logger.info(`api | members`)

  try {
    const token = await getToken(request)

    if (!token) {
      logger.info(`api | members | user | not authorized`)
      response.status(401).send({})
      return
    }

    logger.info(`api | members | query params`)
    const {filter} = request.query

    logger.info(`api | members | query params | filter | ${filter}`)

    if (filter === 'active') {
      
    }

    logger.info(`api | members | db request`)

    const dbRequest = await db.query(`
      SELECT
        user_id,
        lastname,
        firstname,
        array_to_string(experience_with_animal::text[], ',') as experience_with_animal,
        experience_with_animal_other,
        activated_at,
        created_at
      FROM 
        dbo.user u
      WHERE
        status = 'USER'
      
      ${filter === 'active' ? 'AND activated_at IS NOT NULL' : ''}
      ${filter === 'pending' ? 'AND activated_at IS NULL' : ''}
      
      ORDER BY 
        u.lastname, u.firstname
    `, [])

    logger.info(`api | members | response`)

    response.status(200).json(dbRequest.rows)

    return

  } catch(e) {
    logger.info(`api | members | error | ${e}`)

    response.status(500).send({})
  }
}