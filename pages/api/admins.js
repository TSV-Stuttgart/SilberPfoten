import getToken from '../../lib/auth/getToken'
import logger from '../../lib/logger'
import db from '../../lib/db'

export default async function handler(request, response) {
  logger.info(`api | admins`)

  try {
    const token = await getToken(request)

    if (!token) {
      logger.info(`api | admins | user | not authorized`)
      response.status(401).send({})
      return
    }

    logger.info(`api | admins | db request`)

    const dbRequest = await db.query(`
      SELECT 
        lastname,
        firstname,
        status,
        created_at
      FROM 
        dbo.user u
      WHERE
        status = 'ADMIN'
      ORDER BY 
        u.lastname, u.firstname
    `, [])

    logger.info(`api | admins | response`)

    if (dbRequest.rowCount > 0) {
      response.status(200).json(dbRequest.rows)

      return
    }

  } catch(e) {
    logger.info(`api | admins | error | ${e}`)

    response.status(500).send({})
  }
}