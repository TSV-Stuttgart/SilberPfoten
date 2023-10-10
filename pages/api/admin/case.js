import logger from '../../../lib/logger'
import db from '../../../lib/db'

export default async function handler(request, response) {

  logger.info(`api | case`)

  try {
    logger.info(`api | case | db request`)

    const dbRequest = await db.query(`
      SELECT
        m.message_id,
        m.message_type,
        m.subject,
        m.message_text,
        m.search_radius,
        m.city,
        m.zipcode,
        m.gender,
        m.firstname,
        m.lastname,
        m.email,
        m.phone,
        m.street,
        m.street_number,
        m.lat,
        m.lon,
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
        (SELECT array_agg(json_build_object(
          'user_id', ac.user_id,
          'firstname', u.firstname,
          'lastname', u.lastname,
          'email', u.email,
          'mobile', u.mobile,
          'phone', u.phone,
          'accepted_at', ac.accepted_at,
          'accepted_from_user', ac.accepted_from_user,
          'rejected_at', ac.rejected_at,
          'rejected_from_user', ac.rejected_from_user
        )) FROM public.case_has_user ac LEFT JOIN public.user u ON (u.user_id = ac.user_id) WHERE message_id = m.message_id) as accepted_case_users
      FROM
        public.message m
      WHERE
        m.message_id = $1
      ORDER BY 
        created_at 
      DESC
    `, [request.query.caseId]
    )

    logger.info(`api | case | response`)

    response.status(200).json(dbRequest.rows[0] || {})

    return

  } catch(e) {
    logger.info(`api | case | error | ${e}`)

    response.status(500).send([])
  }
}