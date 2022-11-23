import logger from './logger'

module.exports = async (nextContext) => {
    logger.info(`lib | bodyParser`)
    
    return new Promise((resolve, reject) => {
      try {
        const {req} = nextContext
        const responseObject = {}
        let body = ''
      
        req.on('data', (chunk) => {
          logger.info(`lib | bodyParser | on.data | add chunk to body`)

          body += chunk
        })

        req.on('end', () => {
          logger.info(`lib | bodyParser | on.end`)
  
          const params = new URLSearchParams(body)

          logger.info(`lib | bodyParser | URLSearchParams`)
      
          for (const [key, value] of params.entries()) {
            logger.info(`lib | bodyParser | URLSearchParams | responseObject | key | ${key}`)
            responseObject[key] = value
          }
  
          resolve(responseObject)
        })

      } catch(e) {
        logger.info(`lib | bodyParser | error | ${e.name} | ${e.message}`)
        reject(e)
      }
    })
}