import logger from '../logger'
import db from '../db'

const acknowledged = async (queueId, success = true) => {
  logger.info(`lib | queue | acknowledged`)
  
  try {
    logger.info(`lib | queue | acknowledged | queueId | ${queueId}`)
    logger.info(`lib | queue | acknowledged | success | ${success}`)

    let queueRequest

    // success - delete from dbo.queue
    if (success) {

      queueRequest = await db.query(`DELETE FROM public.email_queue WHERE email_queue_id = $1 RETURNING email_queue_id`, [queueId])

      logger.info(`lib | queue | acknowledged | success | true | rowCount | ${queueRequest.rowCount}`)

      if (queueRequest.rowCount > 0) {
        logger.info(`lib | queue | acknowledged | success | true | finished`)

        return true
      }
    }

    logger.info(`lib | queue | acknowledged | success | false`)

    return true

  } catch(e) {
    logger.error(`lib | queue | acknowledged | error | ${e}`)

    return {
      error: true,
      message: e.message,
    }
  }
}

module.exports = acknowledged