import logger from '../../lib/logger'
import db from '../../lib/db'
import getToken from '../../lib/auth/getToken'

export default async function handler(request, response) {

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    var R = 6371 // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1)  // deg2rad below
    var dLon = deg2rad(lon2-lon1) 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    var d = R * c // Distance in km
    return d
  }
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180)
  }

  const user = await getToken(request).then(token => token.user)

  logger.info(`api | messages`)

  try {
    logger.info(`api | messages | db request`)

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

    logger.info(`api | messages | response`)

    let distance
    let messagesInRadius = []
    for (const message of dbMessagesRequest.rows) {

      if(!message.lat || !message.lon || !message.search_radius) { 
        messagesInRadius.push(message)
        continue
      }

      distance = getDistanceFromLatLonInKm(message.lat, message.lon, user.lat, user.lon)

      if(distance <= message.search_radius) {
        messagesInRadius.push(message)
      }
    } 

    response.status(200).json(messagesInRadius)

    return

  } catch(e) {
    logger.info(`api | messages | error | ${e}`)

    response.status(500).send([])
  }
}