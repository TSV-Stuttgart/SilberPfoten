import getToken from '../../../../lib/auth/getToken'
import logger from '../../../../lib/logger'
import db from '../../../../lib/db'

export default async function handler(request, response) {

  logger.info(`api | members`)

  try {
    const token = await getToken(request)

    if (!token) {
      logger.info(`api | members | user | not authorized`)
      response.status(401).send({})
      return
    }

    logger.info(`api | members | db request`)

    const dbRequest = await db.query(`
      SELECT
        user_id,
        gender,
        lastname,
        firstname,
        email,
        birthdate,
        phone,
        street,
        street_number,
        zipcode,
        city,
        job,
        array_to_string(became_aware_through::text[], ',') as became_aware_through,
        became_aware_through_other,
        array_to_string(experience_with_animal::text[], ',') as experience_with_animal,
        experience_with_animal_other,
        array_to_string(support_activity::text[], ',') as support_activity,
        status,
        --blocked,
        activated_at,
        activated_from_user,
        created_at,
        updated_at
      FROM 
        public.user u
      WHERE
        user_id = $1
      ORDER BY 
        u.lastname, u.firstname
    `, [request.query.userId])

    logger.info(`api | members | response`)

    response.status(200).json(dbRequest.rows[0])

    return

  } catch(e) {
    logger.info(`api | members | error | ${e}`)

    response.status(500).send({})
  }
}