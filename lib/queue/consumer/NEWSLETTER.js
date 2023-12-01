import {acknowledged} from '../'
import logger from '../../logger'
import sendMail from '../../sendMail'
import db from '../../db'

const NEWSLETTER = async (queueId, queueName, payload, options = {}) => {
  logger.info(`lib | queue | consumer | NEWSLETTER`)
  
  try {
    logger.info(`lib | queue | consumer | NEWSLETTER | queueId | ${queueId}`)
    logger.info(`lib | queue | consumer | NEWSLETTER | queueName | ${queueName}`)
    logger.info(`lib | queue | consumer | NEWSLETTER | payload | ${JSON.stringify(payload)}`)
    logger.info(`lib | queue | consumer | NEWSLETTER | options | ${JSON.stringify(options)}`)

    const parsedPayload = JSON.parse(payload)
    const {userId, email, emailSubject, templateName, params, dsn} = parsedPayload
    
    logger.info(`lib | queue | consumer | NEWSLETTER | payload | email | ${userId}`)
    logger.info(`lib | queue | consumer | NEWSLETTER | payload | email | ${email}`)
    logger.info(`lib | queue | consumer | NEWSLETTER | payload | emailSubject | ${emailSubject}`)
    logger.info(`lib | queue | consumer | NEWSLETTER | payload | templateName | ${templateName}`)
    logger.info(`lib | queue | consumer | NEWSLETTER | payload | params | ${JSON.stringify(params)}`)

    const sent = await sendMail(email, emailSubject, templateName, params, dsn)

    let updateUserNewsletterRequest

    if (sent.statusCode === 200) {
      logger.info(`lib | queue | consumer | NEWSLETTER | send newsletter email | ${email} | success`)

      logger.info(`lib | queue | consumer | NEWSLETTER | update user newsletter | ${userId}`)

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
      logger.info(`lib | queue | consumer | NEWSLETTER | send newsletter email | ${email} | error | SOFT bounce`)

      updateUserNewsletterRequest = await db.query(`
        UPDATE
          public.user
        SET
          newsletter_bounced = $1,
          newsletter_sent_at = $2
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
    else if (sent.statusCode === 535) {
      logger.info(`lib | queue | consumer | NEWSLETTER | send newsletter email | ${email} | error | WE ARE BLOCKED FROM SENDING EMAILS`)
      logger.info(`lib | queue | consumer | NEWSLETTER | send newsletter email | ${email} | error | WE ARE BLOCKED FROM SENDING EMAILS`)
      logger.info(`lib | queue | consumer | NEWSLETTER | send newsletter email | ${email} | error | WE ARE BLOCKED FROM SENDING EMAILS`)

      response.status(535).json({
        statusCode: 535,
        body: {}
      })
    }
    else if (sent.statusCode === 500) {
      logger.info(`lib | queue | consumer | NEWSLETTER | send newsletter email | ${email} | error | HARD bounce`)

      updateUserNewsletterRequest = await db.query(`
        UPDATE
          public.user
        SET
          newsletter = $1,
          newsletter_sent_at = $1,
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

    if (sent.error) {
      logger.info(`lib | queue | consumer | NEWSLETTER | sendMail | error`)

      await acknowledged(queueId, false)
    }
        
    await acknowledged(queueId)

    return sent

  } catch(e) {
    logger.error(`lib | queue | consumer | NEWSLETTER | error | ${e}`)

    return {
      error: true,
      message: e.message,
    }
  }
}

module.exports = NEWSLETTER