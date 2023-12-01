import logger from '../logger'
import MAIN from './consumer/MAIN'
import NEWSLETTER from './consumer/NEWSLETTER'

const consume = async (queueId, queueName, payload, options = {}) => {
  try {

    logger.info(`lib | queue | consume | queueId | ${queueId}`)
    logger.info(`lib | queue | consume | queueName | ${queueName}`)
    logger.info(`lib | queue | consume | payload | ${JSON.stringify(payload)}`)
    logger.info(`lib | queue | consume | options | ${JSON.stringify(options)}`)

    switch (queueName) {
      case 'MAIN':
        MAIN(queueId, queueName, payload, options)
        break
      case 'NEWSLETTER':
        NEWSLETTER(queueId, queueName, payload, options)
        break
    
      default:
        logger.info(`lib | queue | consume | queue not found`)
        break
    }

  } catch(e) {
    logger.error(`lib | queue | consume | error | ${e.message}`)
    
    return
  }
}

export default consume