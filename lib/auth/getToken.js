import CryptoJS from 'crypto-js'
import jwt from 'jsonwebtoken'
import logger from '../logger'
import db from '../db'

export default async function getToken(request) {
  logger.info(`auth | jwt | getToken | extract cookies`)

  try {
    const {session} = request.cookies

    logger.info(`auth | jwt | getToken | session | ${session?.slice(0,10)}`)
    logger.info(`auth | jwt | getToken | session | decode jwt`)
    
    const jwtDecoded = jwt.verify(session, process.env.JWT_SECRET)
    const bytes = CryptoJS.AES.decrypt(jwtDecoded.encryptedData, process.env.JWT_SECRET)
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    
    logger.info(`auth | jwt | getToken | session | decoded jwt`)
    
    logger.info(`auth | jwt | getToken | session | search active session`)
    
    const dbSessionRequest = await db.query(
      `SELECT
        (SELECT json_build_object(
          'user_id', u.user_id,
          'gender', u.gender,
          'firstname', u.firstname,
          'lastname', u.lastname,
          'email', u.email,
          'birthdate', u.birthdate,
          'phone', u.phone,
          'street', u.street,
          'street_number', u.street_number,
          'zipcode', u.zipcode,
          'city', u.city,
          'job', u.job,
          'status', u.status,
          'became_aware_through', u.became_aware_through,
          'became_aware_through_other', u.became_aware_through_other,
          'experience_with_animal', array_to_string(u.experience_with_animal::text[], ','),
          'experience_with_animal_other', u.experience_with_animal_other,
          'support_activity', array_to_string(u.support_activity::text[], ','),
          'created_at', u.created_at,
          'updated_at', u.updated_at,
          'session_id', s.uuid
        ) FROM dbo.user u WHERE u.user_id = s.user_id) as user
      FROM 
        dbo.session s
      WHERE 
        s.uuid = $1 
      AND s.user_id = $2 
      AND s.expires_on > NOW()`, 
      [decryptedData.sessionUuid, decryptedData.userId]
    )

    logger.info(`auth | jwt | getToken | session | active session | ${dbSessionRequest.rowCount}`)

    if (dbSessionRequest.rowCount > 0) {
      logger.info(`auth | jwt | getToken | session | return active session | ${dbSessionRequest.rows[0].user.session_id}`)
      
      return dbSessionRequest.rows[0]
    }

    logger.info(`auth | jwt | getToken | session | no active session found`)
    logger.info(`auth | jwt | getToken | session | no active session found | return undefined`)
    
    return
  } catch(e) {
    logger.info(`auth | jwt | getToken | session | error | ${e?.name} | ${e?.message}`)

    return
  }
}