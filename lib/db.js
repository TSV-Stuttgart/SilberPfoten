const {Client} = require('pg')
const types = require('pg').types

types.setTypeParser(1114, (stringValue) => stringValue)  //1114 for time without timezone type
types.setTypeParser(1082, (stringValue) => stringValue)  //1082 for date type

module.exports = {
  async query(text, params) {
    const client = new Client()
    
    await client.connect()

    const res = await client.query(text, params)

    await client.end()

    return res
  },
}