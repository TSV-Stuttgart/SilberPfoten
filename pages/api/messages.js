import logger from '../../lib/logger'
import db from '../../lib/db'

export default async function handler(request, response) {

  logger.info(`api | messages`)

  try {
    logger.info(`api | messages | db request`)

    const dbRequest = await db.query(`
      SELECT
        m.message_id,
        m.message_type,
        m.message_text,
        m.search_radius,
        m.city,
        m.zipcode,
        array_to_string(m.experience_with_animal::text[], ',') as experience_with_animal,
        m.experience_with_animal_other,
        array_to_string(m.support_activity::text[], ',') as support_activity,
        m.created_at,
        (SELECT array_agg(user_id) FROM accepted_case WHERE message_id = m.message_id) as accepted_case_memers
      FROM
        message m
      ORDER BY 
        created_at 
      DESC
    `, []
    )

    logger.info(`api | messages | response`)

    response.status(200).json(dbRequest.rows)

    return

  } catch(e) {
    logger.info(`api | messages | error | ${e}`)

    response.status(500).send([])
  }
}