import logger from '../../lib/logger'
import db from '../../lib/db'
import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js'

export default async function handler(request, response) {

  logger.info(`${request.url} | ${request.method}`)

  try {

    if (request.method === 'PATCH' && request.query.token) {

      logger.info(`${request.url} | ${request.method} | token | decode jwt token`)

      const jwtDecoded = jwt.verify(request.query.token, process.env.JWT_SECRET)
      const bytes = CryptoJS.AES.decrypt(jwtDecoded.encryptedData, process.env.JWT_SECRET)
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))

      logger.info(`${request.url} | ${request.method} | token | decode jwt token | check token type`)

      if (decryptedData.type !== 'deactivateNewsletter') {
        logger.info(`${request.url} | ${request.method} | token | decode jwt token | check token type | wrong token type | error`)

        return response.status(400).send()
      }

      logger.info(`${request.url} | ${request.method} | patchRequest`)

      const dbRequest = await db.query(`
        UPDATE
          public.user 
        SET
          newsletter_deactivated = 'now()'
        WHERE
          email = $1
        AND
          user_id = $2
        RETURNING user_id
      `, [
          decryptedData.email,
          decryptedData.userId,
        ]
      )

      logger.info(`${request.url} | ${request.method} | patchRequest | response | rowCount | ${dbRequest.rowCount}`)

      response.status(dbRequest.rowCount > 0 ? 200 : 304).json({})

      return
    }

  } catch(e) {
    logger.info(`api | profile | error | ${e}`)

    response.status(500).send({})
  }
}