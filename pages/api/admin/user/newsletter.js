import getToken from '../../../../lib/auth/getToken'
import db from '../../../../lib/db'
import logger from '../../../../lib/logger'
import sendMail from '../../../../lib/sendMail'
import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js'
import { randomUUID } from 'crypto'

export default async function handler(request, response) {

  logger.info(`${request.url} | ${request.method}`)

  try {
    const token = await getToken(request)

    if (token.user.status !== 'ADMIN') {

      response.status(401).json({})

      return
    }

    if (request.method === 'POST') {

      const {
        userId,
        email,
      } = request.body

      logger.info(`${request.url} | ${request.method} | send newsletter email`)

      const templateName = 'systemChangeover'
      const emailSubject = 'Wichtig! Systemumstellung bei SilberPfoten / Neuer interner Bereich mein.silberpfoten.de'

      logger.info(`${request.url} | ${request.method} | create jwt token`)

      const deactivateNewsletterToken = jwt.sign({
        encryptedData: CryptoJS.AES.encrypt(JSON.stringify({
          userId: userId,
          email: email.toLowerCase(),
          type: 'deactivateNewsletter'
        }), process.env.JWT_SECRET).toString(),
      }, process.env.JWT_SECRET, {expiresIn: '90d'})

      logger.info(`${request.url} | ${request.method} | created jwt token | token: ${deactivateNewsletterToken?.slice(0,50)}`)

      const params = {deactivateNewsletterLink: `${process.env.NEXT_PUBLIC_HOST}/newsletter?token=${deactivateNewsletterToken}`,}
      const emailUUID = randomUUID()

      const dsn = {
        id: emailUUID,
        return: 'headers',
        notify: ['success', 'failure', 'delay'],
        recipient: process.env.EMAIL_USER
      }

      let sent = await sendMail(email, emailSubject, templateName, params, dsn)

      let updateUserNewsletterRequest

      if (sent.statusCode === 200) {
        logger.info(`${request.url} | ${request.method} | send newsletter email | success`)

        logger.info(`${request.url} | ${request.method} | update user newsletter | ${userId}`)

        updateUserNewsletterRequest = await db.query(`
          UPDATE
            public.user
          SET
            newsletter_sent_at = $1,
            newsletter_bounced = $2
          WHERE
            user_id = $3
          RETURNING 
            user_id
          `, [
            new Date().toISOString(),
            null,
            userId,
          ]
        )
      } 
      else if (sent.statusCode === 400) {
        logger.info(`${request.url} | ${request.method} | send newsletter email | error | SOFT bounce`)

        updateUserNewsletterRequest = await db.query(`
          UPDATE
            public.user
          SET
            newsletter_bounced = $1
          WHERE
            user_id = $2
          RETURNING 
            user_id
          `, [
            new Date().toISOString(),
            userId,
          ]
        )
      }
      else if (sent.statusCode === 500) {
        logger.info(`${request.url} | ${request.method} | send newsletter email | error | HARD bounce`)

        updateUserNewsletterRequest = await db.query(`
          UPDATE
            public.user
          SET
            newsletter = $1,
            newsletter_bounced = $2
          WHERE
            user_id = $3
          RETURNING 
            user_id
          `, [
            null,
            new Date().toISOString(),
            userId,
          ]
        )
      }
          
      if (updateUserNewsletterRequest.rowCount > 0) {
        logger.info(`${request.url} | ${request.method} | update user newsletter | success | ${updateUserNewsletterRequest.rowCount} rows`)

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

  } catch(e) {
    logger.info(`api | update user newsletter | error | ${e}`)

    if (e.message.includes('duplicate key')) {
      response.status(200).json({
        statusCode: 500,
        error: 'conflict'
      })

      return
    }

  }
}