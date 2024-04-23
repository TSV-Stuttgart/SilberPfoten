import logger from '../../../lib/logger'
import db from '../../../lib/db'

export default async function handler(request, response) {

  logger.info(`api | cases`)

  try {
    logger.info(`api | cases | db request`)

    const dbRequest = await db.query(`
      SELECT
        m.message_id,
        m.message_type,
        m.subject,
        m.message_text,
        m.search_radius,
        m.city,
        m.zipcode,
        array_to_string(m.experience_with_animal::text[], ',') as experience_with_animal,
        m.experience_with_animal_other,
        array_to_string(m.support_activity::text[], ',') as support_activity,
        m.created_at,
        (SELECT array_agg(json_build_object(
          'user_id', ac.user_id,
          'accepted_at', ac.accepted_at,
          'rejected_at', ac.rejected_at
          --'firstname', u.firstname,
          --'lastname', u.lastname
        )) FROM public.case_has_user ac LEFT JOIN public.user u ON (u.user_id = ac.user_id) WHERE message_id = m.message_id) as accepted_case_users
      FROM
        public.message m
      WHERE
        m.message_type = 'case'
      ORDER BY 
        created_at 
      DESC
    `, []
    )

    logger.info(`api | cases | response`)

    response.status(200).json(dbRequest.rows)

    return

  } catch(e) {
    logger.info(`api | cases | error | ${e}`)

    response.status(500).send([])
  }
}