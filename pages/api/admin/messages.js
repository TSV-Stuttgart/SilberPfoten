import logger from '../../../lib/logger'
import db from '../../../lib/db'

export default async function handler(request, response) {

  
  logger.info(`api | admin | messages`)

  try {
    logger.info(`api | admin | messages | db request`)

    const dbMessagesRequest = await db.query(`
      SELECT
        m.message_id,
        m.message_type,
        m.subject,
        m.message_text,
        m.search_radius,
        m.city,
        m.zipcode,
        m.lat,
        m.lon,
        array_to_string(m.experience_with_animal::text[], ',') as experience_with_animal,
        m.experience_with_animal_other,
        array_to_string(m.support_activity::text[], ',') as support_activity,
        m.created_at,
        (SELECT array_agg(user_id) FROM public.case_has_user WHERE message_id = m.message_id) as accepted_case_members
      FROM
        public.message m
      ORDER BY 
        created_at 
      DESC
    `, []
    )

    logger.info(`api | admin | messages | response`)

    response.status(200).json(dbMessagesRequest.rows)

    return

  } catch(e) {
    logger.info(`api | admin | messages | error | ${e}`)

    response.status(500).send([])
  }
}