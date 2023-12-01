import {consume, getFromQueue} from '../../lib/queue'
import logger from '../../lib/logger'

export default async function handler(request, response) {
  logger.info(`${request.url} | ${request.method}`)

  // consume all queues
  if (request.method === 'POST') {

    const queueRequest = await getFromQueue()

    const acks = []

    for (const queued of queueRequest) {

      const consumed = await consume(queued.email_queue_id, queued.email_type, queued.payload)

      acks.push(consumed)

      await new Promise(r => setTimeout(r, 2000))
    }

    logger.info(`${request.url} | ${request.method} | response | queuedRequests | ${queueRequest.length}`)
    logger.info(`${request.url} | ${request.method} | response | acknowledged | ${acks.length}`)

    response.status(200).json({
      queuedRequests: queueRequest.length,
      acknowledged: acks.length,
    })

    return
  }

  response.status(405).json({
    error: true,
    message: `method not allowed`
  })

  return
}