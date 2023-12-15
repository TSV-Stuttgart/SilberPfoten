import {acknowledged} from '../'
import logger from '../../logger'
import sendMail from '../../sendMail'

const MAIN = async (queueId, queueName, payload, options = {}) => {
  logger.info(`lib | queue | consumer | MAIN`)
  
  try {
    logger.info(`lib | queue | consumer | MAIN | queueId | ${queueId}`)
    logger.info(`lib | queue | consumer | MAIN | queueName | ${queueName}`)
    logger.info(`lib | queue | consumer | MAIN | payload | ${JSON.stringify(payload)}`)
    logger.info(`lib | queue | consumer | MAIN | options | ${JSON.stringify(options)}`)

    const parsedPayload = JSON.parse(payload)
    const {email, emailSubject, templateName, params} = parsedPayload
    
    logger.info(`lib | queue | consumer | MAIN | payload | email | ${email}`)
    logger.info(`lib | queue | consumer | MAIN | payload | emailSubject | ${emailSubject}`)
    logger.info(`lib | queue | consumer | MAIN | payload | templateName | ${templateName}`)
    logger.info(`lib | queue | consumer | MAIN | payload | params | ${JSON.stringify(params)}`)

    const sent = await sendMail(email, emailSubject, templateName, params)

    //if (sent.error) {
    //  logger.info(`lib | queue | consumer | MAIN | sendMail | error`)

    //  await acknowledged(queueId, false)
    //}

    await acknowledged(queueId)

    return sent

  } catch(e) {
    logger.error(`lib | queue | consumer | MAIN | error | ${e}`)

    return {
      error: true,
      message: e.message,
    }
  }
}

module.exports = MAIN