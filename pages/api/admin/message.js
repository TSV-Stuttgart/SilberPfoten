import getToken from '../../../lib/auth/getToken'
import db from '../../../lib/db'
import logger from '../../../lib/logger'
import sharp from 'sharp'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '13mb',
    },
  },
}

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

  const uploadImage = async (messageId, file) => {

    logger.info(`admin | message | case | putImage`)
  
    try {
      logger.info(`admin | message | case | putImage | base64 | ${file.base64?.slice(0,40)}`)
  
      let thumbnail
      let thumbnailMeta
      let processedFile
      
      let processedFileMeta = {
        width: undefined,
        height: undefined,
        size: undefined,
      }
  
      let fileMeta = {
        format: undefined,
        width: undefined,
        height: undefined,
      }
  
      logger.info(`admin | message | case | putImage | base64 | buffer | create`)
  
      const base64Media = file.base64.split(';base64,').pop()
      const bufferedMedia = Buffer.from(base64Media, 'base64')
  
      if (file.base64.includes('data:image/')) {
        fileMeta = await sharp(bufferedMedia).metadata()
  
        logger.info(`admin | message | case | putImage | sharp | image metadata | original | format | ${fileMeta.format}`)
        logger.info(`admin | message | case | putImage | sharp | image metadata | original | size | ${fileMeta.size}`)
        logger.info(`admin | message | case | putImage | sharp | image metadata | original | width | ${fileMeta.width}`)
        logger.info(`admin | message | case | putImage | sharp | image metadata | original | height | ${fileMeta.height}`)
  
        processedFile = await sharp(bufferedMedia).resize(425).toFormat('webp').toBuffer()
        processedFileMeta = await sharp(processedFile).metadata()
  
        logger.info(`admin | message | case | putImage | sharp | image metadata | resized | big | format | ${processedFileMeta.format}`)
        logger.info(`admin | message | case | putImage | sharp | image metadata | resized | big | size | ${processedFileMeta.size}`)
        logger.info(`admin | message | case | putImage | sharp | image metadata | resized | big | width | ${processedFileMeta.width}`)
        logger.info(`admin | message | case | putImage | sharp | image metadata | resized | big | height | ${processedFileMeta.height}`)
  
        thumbnail = await sharp(bufferedMedia).resize(320).toFormat('webp').toBuffer()
        thumbnailMeta = await sharp(thumbnail).metadata()
  
        logger.info(`admin | message | case | putImage | sharp | image metadata | resized | thumbnail | format | ${thumbnailMeta.format}`)
        logger.info(`admin | message | case | putImage | sharp | image metadata | resized | thumbnail | size | ${thumbnailMeta.size}`)
        logger.info(`admin | message | case | putImage | sharp | image metadata | resized | thumbnail | width | ${thumbnailMeta.width}`)
        logger.info(`admin | message | case | putImage | sharp | image metadata | resized | thumbnail | height | ${thumbnailMeta.height}`)
      }
  
      if (!fileMeta.format) {
        logger.info(`admin | message | case | putImage | abort | no match found for media type`)
  
        return {
          error: true,
          message: 'nothing fits this file format',
        }
      }
  
      logger.info(`admin | message | case | putImage | database request`)
  
      const dbRequest = await db.query(`
        INSERT INTO public.message_has_media (
          message_id,
          mimetype,
          filename,
          file,
          thumbnail,
          width,
          height,
          size
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING message_has_media_id, uuid
      `, [
        messageId, 
        fileMeta.format,
        file.filename,
        processedFile,
        thumbnail,
        processedFileMeta.width,
        processedFileMeta.height,
        processedFileMeta.size,
      ])
  
      if (dbRequest.rowCount > 0) {
        logger.info(`admin | message | case | putImage | database request | rowCount | ${dbRequest.rowCount}`)
      
        return dbRequest.rows[0] || {}
      }
  
      return
      
    } catch(e) {
      logger.info(`${request.url} | ${request.method} | putImage | error | ${e}`)
  
      return
    }
  
  }

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
        formUploads,
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
      logger.info(`${request.url} | ${request.method} | body | uploads | ${JSON.stringify(formUploads?.length)}`)

      logger.info(`${request.url} | ${request.method} | get coords from openstreetmap`)

      const location = await (await fetch(`https://nominatim.openstreetmap.org/search/?postalcode=${zipcode}&country=germany&format=json&addressdetails=1&linkedplaces=1&namedetails=1&limit=1&email=info@silberpfoten.de`)).json()
      
      logger.info(`${request.url} | ${request.method} | lat | ${location?.[0]?.lat}`)
      logger.info(`${request.url} | ${request.method} | lon | ${location?.[0]?.lon}`)

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
            lat,
            lon,
            search_radius,
            support_activity,
            experience_with_animal,
            experience_with_animal_other
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
            RETURNING message_id, subject
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
          location && location.length > 0 && location[0].lat ? location[0].lat : null,
          location && location.length > 0 && location[0].lon ? location[0].lon : null,
          searchRadius,
          supportActivity,
          experienceWithAnimal,
          experienceWithAnimalOther,
        ]
      )

      if (dbPutMessageRequest.rowCount > 0) {

        // Upload Images
        if (formUploads) {
          logger.info(`${request.url} | ${request.method} | uploadingImages`)

          for(const upload of formUploads) {
            const messageId = dbPutMessageRequest.rows[0].message_id
            const file = upload

            const uploadedImage = await uploadImage(messageId, file)
          }
        }

        
        logger.info(`${request.url} | ${request.method} | sendEmails | calculate distances`)

        if ((location && location.length > 0 && location[0].lat) && location && location.length > 0 && location[0].lon) {

          let emailReceivers = []

          const getUsersRequest = await db.query(`
            SELECT 
              lastname,
              firstname,
              email,
              lat,
              lon
            FROM 
              public.user
            WHERE
              status = 'USER'
            AND
              activated_at IS NOT NULL
          `, [])

          let distance = 9999999999999
          for (const user of getUsersRequest.rows) {
            logger.info(`${request.url} | ${request.method} | user:${user.firstname},${user.lastname}`)

            if(user.lat && user.lon) { 
              distance = getDistanceFromLatLonInKm(lat, lon, user.lat, user.lon)

              logger.info(`${request.url} | ${request.method} | distance:${distance}`)
            }

            if(distance <= searchRadius) {
              logger.info(`${request.url} | ${request.method} | radius:${searchRadius}`)

              emailReceivers.push(user)
            }
          }

          logger.info(`${request.url} | ${request.method} | sendEmails | to users in search radius`)

          // SEND NOW to all users in emailReceivers

        }
        else {

          logger.info(`${request.url} | ${request.method} | sendEmails | calculate distances | couldn't find coordinates for case`)
        }

        logger.info(`${request.url} | ${request.method} | putRequest | success | ${JSON.stringify(dbPutMessageRequest.rows[0])}`)

        response.status(200).json({
          statusCode: 200,
          body: {caseId: dbPutMessageRequest.rows[0].message_id, subject: dbPutMessageRequest.rows[0].subject}
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
        experienceWithAnimalOther,
        formUploads,
      } = request.body

      logger.info(`${request.url} | ${request.method} | query | messageId | ${request.query.messageId}`)

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
      logger.info(`${request.url} | ${request.method} | body | uploads | ${JSON.stringify(formUploads?.length)}`)

      logger.info(`${request.url} | ${request.method} | get coords from openstreetmap`)

      const location = await (await fetch(`https://nominatim.openstreetmap.org/search/?postalcode=${zipcode}&country=germany&format=json&addressdetails=1&linkedplaces=1&namedetails=1&limit=1&email=info@silberpfoten.de`)).json()
      
      logger.info(`${request.url} | ${request.method} | lat | ${location?.[0]?.lat}`)
      logger.info(`${request.url} | ${request.method} | lon | ${location?.[0]?.lon}`)

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
          lat = $12,
          lon = $13,
          search_radius = $14,
          support_activity = $15,
          experience_with_animal = $16,
          experience_with_animal_other = $17
        WHERE
          message_id = $18
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
          location && location.length > 0 && location[0].lat ? location[0].lat : null,
          location && location.length > 0 && location[0].lon ? location[0].lon : null,
          searchRadius,
          supportActivity,
          experienceWithAnimal,
          experienceWithAnimalOther,
          request.query.messageId
        ]
      )

      if (dbPatchMessageRequest.rowCount > 0) {

        // Upload Images
        for(const upload of formUploads) {
          const messageId = dbPatchMessageRequest.rows[0].message_id
          const file = upload

          const uploadedImage = await uploadImage(messageId, file)
        }

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
