import logger from '../logger'
import db from '../db'

const getFromQueue = async (options = {}) => {
  logger.info(`lib | queue | getFromQueue`)
  
  try {
    logger.info(`lib | queue | getFromQueue | options | ${JSON.stringify(options)}`)

    const queueRequest = await db.query(`
      UPDATE
        public.email_queue
      SET
        in_progress = true
      WHERE
        execute_at <= $1 
      AND 
        in_progress = false
      RETURNING *
    `, [
        new Date(),
      ]
    )

    logger.info(`lib | queue | getFromQueue | rowCount | ${queueRequest.rowCount}`)

    return queueRequest.rows || []

  } catch(e) {
    logger.error(`lib | queue | getFromQueue | error | ${e}`)

    return {
      error: true,
      message: e.message,
    }
  }
}

module.exports = getFromQueue