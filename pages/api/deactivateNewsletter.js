import logger from '../../lib/logger'
import db from '../../lib/db'
import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js'
import { sendToQueue } from '../../lib/queue'

export default async function handler(request, response) {

  logger.info(`${request.url} | ${request.method}`)

  try {

    if (request.method === 'DELETE' && request.query.token) {

      logger.info(`${request.url.slice(0, 50)} | ${request.method} | token | decode jwt token`)

      const jwtDecoded = jwt.verify(request.query.token, process.env.JWT_SECRET)
      const bytes = CryptoJS.AES.decrypt(jwtDecoded.encryptedData, process.env.JWT_SECRET)
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))

      logger.info(`${request.url.slice(0, 50)} | ${request.method} | token | decode jwt token | check token type`)

      if (decryptedData.type !== 'deactivateNewsletter') {
        logger.info(`${request.url.slice(0, 50)} | ${request.method} | token | decode jwt token | check token type | wrong token type | error`)

        return response.status(400).send()
      }

      logger.info(`${request.url.slice(0, 50)} | ${request.method} | delete account | deleteRequest`)
      const dbRequest = await db.query(`DELETE FROM public.user WHERE user_id = $1 AND email = $2 RETURNING firstname, lastname`, [decryptedData.userId, decryptedData.email,])
      logger.info(`${request.url} | ${request.method} | delete account | deleteRequest | response | rowCount | ${dbRequest.rowCount}`)

      if (dbRequest.rowCount === 0) {
        logger.info(`${request.url.slice(0, 50)} | ${request.method} | delete account | deleteRequest | error`)

        return response.status(403).send()
      }

      logger.info(`${request.url.slice(0, 50)} | ${request.method} | delete account | delete session in database`)
      await db.query(`DELETE FROM public.session WHERE user_id = $1`, [decryptedData.userId])
      logger.info(`${request.url.slice(0, 50)} | ${request.method} | delete account | delete session in database | deleted`)

      logger.info(`${request.url.slice(0, 50)} | ${request.method} | delete account | cookie | invalidate`)
      response.setHeader('set-cookie',`session=deleted; SameSite=Lax; HttpOnly; Path=/; Expires=${new Date('1970-01-01').toUTCString()}`)

      logger.info(`${request.url.slice(0, 50)} | ${request.method} | delete account | db getAdminsRequest`)

      const dbGetAdminsRequest = await db.query(
        `SELECT email FROM public.user WHERE status = 'ADMIN'`
      )

      logger.info(`${request.url.slice(0, 50)} | ${request.method} | delete account | send mail`)

      const to = 'info@silberpfoten.de'
      const templateName = 'userDeletionNotification'
      const subject = 'User Löschung'
      const params = {
        email: decryptedData.email,
        firstname: dbRequest.rows[0].firstname,
        lastname: dbRequest.rows[0].lastname,
      }

      const data = {
        email: to,
        emailSubject: subject,
        templateName: templateName,
        params: params,
      }

      await sendToQueue('MAIN', data)

      if (sent.statusCode === 200) {
        logger.info(`${request.url.slice(0, 50)} | ${request.method} | delete account | send mail | sent`)
      } else {
        logger.info(`${request.url.slice(0, 50)} | ${request.method} | delete account | send mail | error`)
      }

      response.status(200).send({})

      return
    }

  } catch(e) {
    logger.info(`${request.url.slice(0, 50)} | ${request.method} | error | ${e}`)

    response.status(500).send({})
  }
}