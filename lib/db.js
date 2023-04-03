const {Pool} = require('pg')
const types = require('pg').types

types.setTypeParser(1114, (stringValue) => stringValue)  //1114 for time without timezone type
types.setTypeParser(1082, (stringValue) => stringValue)  //1082 for date type

module.exports = {
  async query(text, params) {
    const pool = new Pool()

    const res = await pool.query(text, params)

    return res
  },
}