import getToken from '../../../lib/auth/getToken'
import db from '../../../lib/db'
import logger from '../../../lib/logger'

export default async function handler(request, response) {
  logger.info(`${request.url} | ${request.method}`)

  try {
    const token = await getToken(request)

    if (token.user.status !== 'ADMIN') {

      response.status(401).json({})

      return
    }

    if (request.method === 'DELETE') {

      logger.info(`${request.url} | ${request.method} | deleteRequest`)

      const dbDeleteMessageRequest = await db.query(`DELETE FROM public.message WHERE message_id = $1 RETURNING message_id`, [request.query.messageId])

      if (dbDeleteMessageRequest.rowCount > 0) {
        logger.info(`${request.url} | ${request.method} | deleteRequest | success | ${JSON.stringify(dbDeleteMessageRequest.rows[0])}`)

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

    if (request.method === 'PUT') {

      const {
        type,
        subject,
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

      logger.info(`${request.url} | ${request.method} | body | type | ${type}`)
      logger.info(`${request.url} | ${request.method} | body | subject | ${subject}`)
      logger.info(`${request.url} | ${request.method} | body | description | ${description}`)
      logger.info(`${request.url} | ${request.method} | body | gender | ${gender}`)
      logger.info(`${request.url} | ${request.method} | body | lastname | ${lastname}`)
      logger.info(`${request.url} | ${request.method} | body | firstname | ${firstname}`)
      logger.info(`${request.url} | ${request.method} | body | email | ${email}`)
      logger.info(`${request.url} | ${request.method} | body | phone | ${phone}`)
      logger.info(`${request.url} | ${request.method} | body | street | ${street}`)
      logger.info(`${request.url} | ${request.method} | body | streetNumber | ${streetNumber}`)
      logger.info(`${request.url} | ${request.method} | body | zipcode | ${zipcode}`)
      logger.info(`${request.url} | ${request.method} | body | city | ${city}`)
      logger.info(`${request.url} | ${request.method} | body | searchRadius | ${searchRadius}`)
      logger.info(`${request.url} | ${request.method} | body | supportActivity | ${supportActivity}`)
      logger.info(`${request.url} | ${request.method} | body | experienceWithAnimal | ${experienceWithAnimal}`)
      logger.info(`${request.url} | ${request.method} | body | experienceWithAnimalOther | ${experienceWithAnimalOther}`)

      logger.info(`${request.url} | ${request.method} | putRequest`)

      const dbPutMessageRequest = await db.query(`
        INSERT INTO 
          public.message (
            message_type,
            subject,
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
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
            RETURNING message_id
        `, 
        [
          type,
          subject,
          description,
          gender,
          firstname,
          lastname,
          phone,
          email ? email : null,
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

      if (dbPutMessageRequest.rowCount > 0) {
        logger.info(`${request.url} | ${request.method} | putRequest | success | ${JSON.stringify(dbPutMessageRequest.rows[0])}`)

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

    if (request.method === 'PATCH') {

      const {
        subject,
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
        experienceWithAnimalOther
      } = request.body

      logger.info(`${request.url} | ${request.method} | query | messageId | ${request.query.messageId}`)
      logger.info(`${request.url} | ${request.method} | body | subject | ${subject}`)
      logger.info(`${request.url} | ${request.method} | body | description | ${description}`)
      logger.info(`${request.url} | ${request.method} | body | gender | ${gender}`)
      logger.info(`${request.url} | ${request.method} | body | lastname | ${lastname}`)
      logger.info(`${request.url} | ${request.method} | body | firstname | ${firstname}`)
      logger.info(`${request.url} | ${request.method} | body | email | ${email}`)
      logger.info(`${request.url} | ${request.method} | body | phone | ${phone}`)
      logger.info(`${request.url} | ${request.method} | body | street | ${street}`)
      logger.info(`${request.url} | ${request.method} | body | streetNumber | ${streetNumber}`)
      logger.info(`${request.url} | ${request.method} | body | zipcode | ${zipcode}`)
      logger.info(`${request.url} | ${request.method} | body | city | ${city}`)
      logger.info(`${request.url} | ${request.method} | body | searchRadius | ${searchRadius}`)
      logger.info(`${request.url} | ${request.method} | body | supportActivity | ${supportActivity}`)
      logger.info(`${request.url} | ${request.method} | body | experienceWithAnimal | ${experienceWithAnimal}`)
      logger.info(`${request.url} | ${request.method} | body | experienceWithAnimalOther | ${experienceWithAnimalOther}`)

      logger.info(`${request.url} | ${request.method} | patchRequest`)

      const dbPatchMessageRequest = await db.query(`
        UPDATE
          public.message
        SET
          subject = $1,
          message_text = $2,
          gender = $3,
          firstname = $4,
          lastname = $5,
          phone = $6,
          email = $7,
          street = $8,
          street_number = $9,
          zipcode = $10,
          city = $11,
          search_radius = $12,
          support_activity = $13,
          experience_with_animal = $14,
          experience_with_animal_other = $15
        WHERE
          message_id = $16
        RETURNING 
          message_id
        `, [
          subject,
          description,
          gender,
          firstname,
          lastname,
          phone,
          email ? email : null,
          street,
          streetNumber,
          zipcode,
          city,
          searchRadius,
          supportActivity,
          experienceWithAnimal,
          experienceWithAnimalOther,
          request.query.messageId
        ]
      )

      if (dbPatchMessageRequest.rowCount > 0) {
        logger.info(`${request.url} | ${request.method} | patchRequest | success | ${JSON.stringify(dbPatchMessageRequest.rows[0])}`)

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
