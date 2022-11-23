import nodemailer from 'nodemailer'
import logger from '../logger'

module.exports = () => {
  logger.info(`lib | nodemailer | createTransport`)

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true" ? true : false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}