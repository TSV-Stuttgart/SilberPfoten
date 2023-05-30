import getToken from '../../../../lib/auth/getToken'
import db from '../../../../lib/db'
import logger from '../../../../lib/logger'

export default async function handler(request, response) {
  logger.info(`${request.url} | ${request.method}`)

  try {
    const token = await getToken(request)

    if (token.user.status !== 'ADMIN') {

      response.status(401).json({})

      return
    }

    if (request.method === 'DELETE') {

      logger.info(`${request.url} | ${request.method} | deleteRequest`)

      const dbDeleteMessageMediaRequest = await db.query(`DELETE FROM public.message_has_media WHERE message_has_media_id = $1 RETURNING message_has_media_id, uuid`, [request.query.mediaId])

      if (dbDeleteMessageMediaRequest.rowCount > 0) {
        logger.info(`${request.url} | ${request.method} | deleteRequest | success | ${JSON.stringify(dbDeleteMessageMediaRequest.rows[0])}`)

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

    response.status(405).send()

  } catch(e) {
    logger.info(`${request.url} | ${request.method} | error | ${e}`)

    if (e.message.includes('duplicate key')) {
      response.status(200).json({
        statusCode: 500,
        error: 'conflict'
      })

      return
    }

    response.status(200).json({
      statusCode: 500,
      error: 'invalid token'
    })
  }

}