import db from '../../../lib/db'
import logger from '../../../lib/logger'

export default async function handler(request, response) {
  logger.info(`api | admin | message`)

  try {
    if (request.method === 'DELETE') {
      logger.info(`api | admin | message | DELETE`)
      logger.info(`api | admin | message | DELETE | database request`)

      const dbDeleteMessageRequest = await db.query(`DELETE FROM message WHERE message_id = $1 RETURNING message_id`, [request.query.messageId])

      if (dbDeleteMessageRequest.rowCount > 0) {
        logger.info(`api | admin | message | DELETE | deleted`)

        response.status(200).json({
          statusCode: 200,
          body: {}
        })

        return
      }

      response.status(200).json({
        statusCode: 500,
        body: {}
      })

      return
    }

    if (request.method === 'POST') {
      logger.info(`api | admin | message | POST`)

      const {
        type,
        description,
        gender,
        lastname,
        firstname,
        email,
        phone,
        street,
        streetNumber,
        zipcode,
        city,
        searchRadius,
        supportActivity,
        experienceWithAnimal,
        experienceWithAnimalOther,
      } = request.body

      const dbInsertMessageRequest = await db.query(`
        INSERT INTO 
          message (
            message_type,
            message_text,
            gender,
            firstname,
            lastname,
            phone,
            email,
            street,
            street_number,
            zipcode,
            city,
            search_radius,
            support_activity,
            experience_with_animal,
            experience_with_animal_other
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        `, 
        [
          type,
          description,
          gender,
          firstname,
          lastname,
          phone,
          email,
          street,
          streetNumber,
          zipcode,
          city,
          searchRadius,
          supportActivity,
          experienceWithAnimal,
          experienceWithAnimalOther,
        ]
      )

      if (dbInsertMessageRequest.rowCount > 0) {

        response.status(200).json({
          statusCode: 200,
          body: {}
        })

        return
      }

      response.status(200).json({
        statusCode: 500,
        body: {}
      })

      return
    }

    response.status(405).send()

  } catch(e) {
    logger.info(`api | admin | message | error | ${e}`)

    if (e.message.includes('duplicate key')) {
      response.status(200).json({
        statusCode: 500,
        error: 'conflict'
      })

      return
    }

    response.status(200).json({
      statusCode: 500,
      error: 'invalid token'
    })
  }
}
