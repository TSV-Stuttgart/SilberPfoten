import logger from '../logger'
import db from '../db'

const sendToQueue = async (type, payload, options = {}) => {
  logger.info(`lib | queue | sendToQueue`)

  try {
    logger.info(`lib | queue | sendToQueue | type | ${type}`)
    logger.info(`lib | queue | sendToQueue | payload | ${JSON.stringify(payload)}`)
    logger.info(`lib | queue | sendToQueue | options | ${JSON.stringify(options)}`)

    const getCurrentQueue = await db.query(
      `SELECT execute_at FROM public.email_queue ORDER BY execute_at DESC LIMIT 1`
    )
    
    let newExecuteAt = new Date()

    if (getCurrentQueue.rows.length > 0 && new Date(`${getCurrentQueue.rows[0].execute_at}Z`).getTime() >= new Date().setSeconds(new Date().getSeconds() - 72)) {

      // 72 Sekunden Abstand zwischen den Emails = 50 Emails pro Stunde
      newExecuteAt = new Date(new Date(getCurrentQueue.rows[0].execute_at).setSeconds(new Date(getCurrentQueue.rows[0].execute_at).getSeconds() + 72))
    }

    const queueRequest = await db.query(
      `INSERT INTO public.email_queue (email_type, payload, execute_at) VALUES ($1,$2,$3) RETURNING email_queue_id`,
      [
        type,
        payload,
        newExecuteAt,
      ]
    )

    logger.info(`lib | queue | sendToQueue | rowCount | ${queueRequest.rowCount}`)

    if (queueRequest.rowCount > 0) {
      logger.info(`lib | queue | sendToQueue | success`)

      return true
    }

    logger.info(`lib | queue | sendToQueue | error sending to queue`)

    return

  } catch(e) {
    logger.error(`lib | queue | sendToQueue | error | ${e}`)

    return {
      error: true,
      message: e.message,
    }
  }
}

module.exports = sendToQueue