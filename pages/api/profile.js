import getToken from '../../lib/auth/getToken'
import logger from '../../lib/logger'
import db from '../../lib/db'
import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js'
import sendMail from '../../lib/sendMail'
import putAudit from '../../database/queries/audit/putAudit'

export default async function handler(request, response) {

  logger.info(`api | profile`)

  try {
    const token = await getToken(request)

    if (!token) {
      logger.info(`api | profile | user | not authorized`)
      response.status(401).send({})
      return
    }

    if (request.method === 'PATCH' && request.query.token) {

      logger.info(`api | profile | user | confirm new email`)

      logger.info(`api | profile | user | confirm new email | decode jwt token`)

      const jwtDecoded = jwt.verify(request.query.token, process.env.JWT_SECRET)
      const bytes = CryptoJS.AES.decrypt(jwtDecoded.encryptedData, process.env.JWT_SECRET)
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))

      logger.info(`api | profile | user | confirm new email | check token type`)

      if (decryptedData.type !== 'patchUserEmail') {
        logger.info(`api | profile | user | confirm new email | check token type | wrong token type | error`)

        response.status(400).send()
        
        return
      }

      logger.info(`api | profile | user | confirm new email | check user identity`)

      if (decryptedData.currentEmail !== token.user.email || decryptedData.userId !== token.user.user_id) {
        logger.info(`api | profile | user | confirm new email | check user identity | wrong identity | error`)

        response.status(403).send()

        return
      }

      logger.info(`api | profile | user | confirm new email | check email`)

      const checkEmailRequest = await db.query(`
        SELECT 
          user_id
        FROM 
          public.user 
        WHERE 
         email = $1`, 
        [decryptedData.newEmail]
      )

      if (checkEmailRequest.rowCount > 0) {
        logger.info(`api | profile | user | confirm new email | check email | email already exists | error`)

        response.status(409).send()
  
        return
      }

      logger.info(`api | profile | user | confirm new email | patchRequest`)

      const dbRequest = await db.query(`
        UPDATE
          public.user 
        SET
          email = $1,
          updated_at = 'now()'
        WHERE
          user_id = $2
        RETURNING user_id
      `, [
          decryptedData.newEmail,
          decryptedData.userId,
        ]
      )

      logger.info(`api | profile | user | confirm new email | patchRequest | response`)

      response.status(dbRequest.rowCount > 0 ? 200 : 304).json({})

      return

    }

    else if (request.method === 'PATCH' && !request.query.token) {

      logger.info(`api | profile | change data`)

      const {
        firstname,
        lastname,
        email,
        phone,
        birthdate,
        job,
        street,
        streetNumber,
        zipcode,
        city,
        support_activity,
        experience_with_animal,
        experience_with_animal_other,
      } = request.body

      logger.info(`api | profile | change data | get coords from openstreetmap`)

      const location = await (await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${zipcode}&country=germany&format=json&addressdetails=1&linkedplaces=1&namedetails=1&limit=1&email=info@silberpfoten.de`)).json()
      
      logger.info(`api | profile | change data | lat | ${location?.[0]?.lat}`)
      logger.info(`api | profile | change data | lon | ${location?.[0]?.lon}`)

      logger.info(`api | profile | change data | db request`)

      const dbRequest = await db.query(`
        UPDATE
          public.user 
        SET
          birthdate = $1,
          phone = $2,
          job = $3,
          street = $4,
          street_number = $5,
          zipcode = $6,
          city = $7,
          lat = $8,
          lon = $9,
          experience_with_animal = $10,
          experience_with_animal_other = $11,
          support_activity = $12,
          firstname = $13,
          lastname = $14,
          updated_at = 'now()'
        WHERE
          user_id = $15
        RETURNING user_id
      `, [
          birthdate,
          phone,
          job,
          street,
          streetNumber,
          zipcode,
          city,
          location && location.length > 0 && location[0].lat ? location[0].lat : null,
          location && location.length > 0 && location[0].lon ? location[0].lon : null,
          experience_with_animal.length > 0 ? experience_with_animal : null,
          experience_with_animal_other,
          support_activity.length > 0 ? support_activity : null,
          firstname,
          lastname,
          token.user.user_id,
        ]
      )

      logger.info(`api | profile | change data | response`)

      if (token.user.email !== email) {
        
        logger.info(`api | profile | change data | change email | create jwt token`)

        const changeEmailToken = jwt.sign({
          encryptedData: CryptoJS.AES.encrypt(JSON.stringify({
            userId: token.user.user_id,
            currentEmail: token.user.email,
            newEmail: email,
            type: 'patchUserEmail'
          }), process.env.JWT_SECRET).toString(),
        }, process.env.JWT_SECRET, {expiresIn: '10m'})

        const templateName = 'changeEmailAdress'
        const subject = 'E-Mail-Adresse ändern'
        const params = {
          firstname: token.user.firstname,
          newEmail: email,
          //changeEmailLink: `${process.env.NEXT_PUBLIC_HOST}?token=${changeEmailToken}`

          // Temporär bis NEXT_PUBLIC_HOST geändert wurde
          changeEmailLink: `https://mein.silberpfoten.de?token=${changeEmailToken}`
        }

        const sent = await sendMail(token.user.email, subject, templateName, params)

        if (sent.statusCode === 200) {
          logger.info(`api | profile | change data | change email | send mail | sent`)
        } else {
          logger.info(`api | profile | change data | change email | send mail | error`)
        }

        response.status(200).send({changeEmail: true})

        return
      }

      response.status(dbRequest.rowCount > 0 ? 200 : 304).json({})

      return

    }

    else if (request.method === 'DELETE') {

      logger.info(`api | profile | delete account`)

      await db.query(`DELETE FROM public.user WHERE user_id = $1`, [token.user.user_id])

      putAudit('deleteAccount', {user_id: token.user.user_id})

      logger.info(`api | profile | delete account | response`)

      logger.info(`api | profile | delete account | delete session in database`)
      await db.query(`DELETE FROM public.session WHERE user_id = $1`, [token.user.user_id])
      logger.info(`api | profile | delete account | delete session in database | deleted`)

      logger.info(`api | profile | delete account | cookie | invalidate`)
      
      response.setHeader('set-cookie',`session=deleted; SameSite=Lax; HttpOnly; Path=/; Expires=${new Date('1970-01-01').toUTCString()}`)
      
      logger.info(`api | profile | delete account | db getAdminsRequest`)

      const dbGetAdminsRequest = await db.query(
        `SELECT email FROM public.user WHERE status = 'ADMIN'`
      )

      logger.info(`api | profile | delete account | send mail`)

      const to = 'info@silberpfoten.de'
      const templateName = 'userDeletionNotification'
      const subject = 'User Löschung'
      const params = {
        email: token.user.email,
        firstname: token.user.firstname,
        lastname: token.user.lastname,
      }

      sent = await sendMail(to, subject, templateName, params)

      if (sent.statusCode === 200) {
        logger.info(`api | profile | delete account | send mail | sent`)
      } else {
        logger.info(`api | profile | delete account | send mail | error`)
      }

      response.status(200).send()
    }

  } catch(e) {
    logger.info(`api | profile | error | ${e}`)

    response.status(500).send({})
  }
}