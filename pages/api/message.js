import logger from '../../lib/logger'
import db from '../../lib/db'
import getToken from '../../lib/auth/getToken'

export default async function handler(request, response) {

  logger.info(`api | message`)

  try {
    logger.info(`api | message | db request`)

    const token = await getToken(request)

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
        (SELECT array_agg(user_id) FROM public.case_has_user WHERE message_id = m.message_id AND user_id = $2) as accepted_case_members,
        (SELECT json_build_object(
          'user_id', user_id,
          'accepted_at', accepted_at,
          'rejected_at', rejected_at
        ) FROM public.case_has_user WHERE message_id = m.message_id AND user_id = $2) as case_status
      FROM
        public.message m
      WHERE
        m.message_id = $1
    `, [
        request.query.messageId, 
        token.user.user_id
      ]
    )

    logger.info(`api | message | response`)

    response.status(200).json(dbRequest.rows[0] || {})

    return

  } catch(e) {
    logger.info(`api | message | error | ${e}`)

    response.status(500).send([])
  }
}