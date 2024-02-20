import {Pool} from 'pg'
import logger from './logger'

const types = require('pg').types

types.setTypeParser(1114, (stringValue) => stringValue.replace(' ', 'T'))  //1114 for time without timezone type
types.setTypeParser(1082, (stringValue) => stringValue)  //1082 for date type

const pool = new Pool({
  max: process.env.NODE_ENV === 'production' ? 40 : 10
})

pool.on('connect', (client) => {
  logger.info(`lib | db | pool.on | connect | client | processID(${client.processID})`)
})

pool.on('acquire', (client) => {
  logger.info(`lib | db | pool.on | acquire | client | processID(${client.processID})`)
})

pool.on('release', (error, client) => {
  logger.info(`lib | db | pool.on | release | client | processID(${client.processID})`)
  
  if (error) {
    logger.error(`lib | db | pool.on | release | error | client | processID(${client.processID})`)
    logger.error(`lib | db | pool.on | release | error | ${error}`)
  }
})

pool.on('remove', (client) => {
  logger.info(`lib | db | pool.on | remove | client | processID(${client.processID})`)
})

pool.on('error', (error, client) => {
  logger.error(`lib | db | pool.on | error | client | processID(${client.processID})`)
  
  if (error) {
    logger.error(`lib | db | pool.on | error | client | processID(${client.processID})`)
    logger.error(`lib | db | pool.on | error | ${error}`)
  }
})

module.exports = pool