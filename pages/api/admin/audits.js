import logger from '../../../lib/logger'
import db from '../../../lib/db'

export default async function handler(request, response) {

  logger.info(`api | audits`)

  const timePeriod = request.query.timePeriod

  logger.info(`api | audits | timePeriod | ${timePeriod}`)

  let currentTimePeriodStart = null
  let lastTimePeriodStart = null

  if (timePeriod === 'LAST24H') {
    currentTimePeriodStart = new Date(new Date().setDate(new Date().getDate() - 1))
    lastTimePeriodStart = new Date(new Date().setDate(new Date().getDate() - 2))
  }
  else if (timePeriod === 'LAST7D') {
    currentTimePeriodStart = new Date(new Date().setDate(new Date().getDate() - 7))
    lastTimePeriodStart = new Date(new Date().setDate(new Date().getDate() - 14))
  }
  else if (timePeriod === 'LAST30D') {
    currentTimePeriodStart = new Date(new Date().setDate(new Date().getDate() - 30))
    lastTimePeriodStart = new Date(new Date().setDate(new Date().getDate() - 60))
  }
  else if (timePeriod === 'LAST365D') {
    currentTimePeriodStart = new Date(new Date().setDate(new Date().getDate() - 365))
    lastTimePeriodStart = new Date(new Date().setDate(new Date().getDate() - 730))
  }
  else {
    return response.status(400).send()
  }

  try {
    logger.info(`api | audits | db request | getCurrentPeriod`)

    const getCurrentPeriod = await db.query(`
      SELECT
        audit_id,
        action_type,
        created_at
      FROM
        public.audit
      WHERE
        created_at >= $1
    `, [currentTimePeriodStart]
    )

    logger.info(`api | audits | db request | getLastPeriod`)

    const getLastPeriod = await db.query(`
      SELECT
        audit_id,
        action_type,
        created_at
      FROM
        public.audit
      WHERE
        created_at < $1
      AND
        created_at >= $2
    `, [currentTimePeriodStart, lastTimePeriodStart]
    )

    logger.info(`api | audits | response`)

    response.status(200).json({currentAuditPeriod: getCurrentPeriod.rows, lastAuditPeriod: getLastPeriod.rows})

    return

  } catch(e) {
    logger.info(`api | audits | error | ${e}`)

    response.status(500).send([])
  }
}