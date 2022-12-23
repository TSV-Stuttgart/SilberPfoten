import getToken from '../../../lib/auth/getToken'
import logger from '../../../lib/logger'

export default async function handler(request, response) {

  try {
    logger.info(`api | auth | session`)
		
    const token = await getToken(request)
		
    if (token) {
			logger.info(`api | auth | session | found`)

			response.status(200).json(token)
			
			return
    }

		logger.info(`api | auth | session | not found`)

		response.status(404).send()
  } catch(e) {
    logger.info(`api | auth | session | error | ${e}`)

    response.status(500).send()
  }
}