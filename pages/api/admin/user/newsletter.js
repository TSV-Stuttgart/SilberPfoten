import getToken from '../../../../lib/auth/getToken'
import db from '../../../../lib/db'
import logger from '../../../../lib/logger'
import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js'
import { randomUUID } from 'crypto'
import { sendToQueue } from '../../../../lib/queue'

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

      logger.info(`${request.url} | ${request.method} | send newsletter email | ${email}`)

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

      const deactivateNewsletterLink = `${process.env.NEXT_PUBLIC_HOST}/newsletter?token=${deactivateNewsletterToken}`

      const params = {deactivateNewsletterLink: deactivateNewsletterLink}
      const emailUUID = randomUUID()

      const dsn = {
        id: emailUUID,
        return: 'headers',
        notify: ['success', 'failure', 'delay'],
        recipient: process.env.EMAIL_USER
      }

      const data = {
        userId: userId,
        email: email,
        emailSubject: emailSubject,
        templateName: templateName,
        params: params,
        dsn: dsn,
      }

      await sendToQueue('NEWSLETTER', data)

      await db.query(`
        UPDATE
          public.user
        SET
          newsletter_sent_at = $1
        WHERE
          user_id = $2
        RETURNING 
          user_id
        `, [
          new Date(),
          userId,
        ]
      )

      response.status(200).send()
    }

    response.status(405).send()

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