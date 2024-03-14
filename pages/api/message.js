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
        m.email,
        m.phone,
        array_to_string(m.experience_with_animal::text[], ',') as experience_with_animal,
        m.experience_with_animal_other,
        array_to_string(m.support_activity::text[], ',') as support_activity,
        m.created_at,
        (SELECT json_agg(json_build_object(
          'message_has_media_id', mhm.message_has_media_id,
          'filename', mhm.filename,
          'file', encode(mhm.file, 'base64'),
          'thumbnail', encode(mhm.thumbnail, 'base64'),
          'size', mhm.size,
          'width', mhm.width,
          'height', mhm.height,
          'mimetype', mhm.mimetype
        )) FROM public.message_has_media mhm WHERE mhm.message_id = m.message_id) as has_media,
        (SELECT array_agg(user_id) FROM public.case_has_user WHERE message_id = m.message_id AND user_id = $2) as accepted_case_members,
        (SELECT json_build_object(
          'user_id', user_id,
          'accepted_at', accepted_at,
          'rejected_at', rejected_at
        ) FROM public.case_has_user WHERE message_id = m.message_id AND user_id = $2) as case_status,
        CASE WHEN EXISTS(SELECT 1 FROM public.case_has_user WHERE message_id = m.message_id AND user_id = $2 AND accepted_at IS NOT NULL) THEN (m.phone) ELSE (NULL) END as phone
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