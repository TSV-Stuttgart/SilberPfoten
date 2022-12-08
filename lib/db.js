const {Client} = require('pg')
const logger = require('./logger')

module.exports = {
  async query(text, params) {
    const client = new Client()

    // logger.info(`lib | database | client | new`)
    
    await client.connect()

    // logger.info(`lib | database | client | connect`)

    const start = Date.now()
    const res = await client.query(text, params)

    // logger.info(`lib | database | client | query`)

    const duration = Date.now() - start

    // logger.info(`lib | database | client | query | text | ${text}`)
    // logger.info(`lib | database | client | query | duration | ${duration}`)
    // logger.info(`lib | database | client | query | rows | ${res.rowCount}`)

    await client.end()

    // logger.info(`lib | database | client | query | connection | closed`)

    return res
  },
}