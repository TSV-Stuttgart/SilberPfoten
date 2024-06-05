import logger from './logger'
import mjml2html from 'mjml'
import path from 'path'
import {compile} from 'handlebars'
import fs from 'fs'

module.exports = async (to, subject, templateName, params, dsn = {}) => {
  logger.info(`lib | sendMail | prepare mjml template`)

  try {

    // prevent emails from being sent in development
    if (process.env.NODE_ENV === 'development') {
      logger.info(`lib | sendMail | sendEmail | development mode`)
      logger.info(`lib | sendMail | sendEmail | development mode | to | ${to}`)
      logger.info(`lib | sendMail | sendEmail | development mode | subject | ${subject}`)
      logger.info(`lib | sendMail | sendEmail | development mode | templateName | ${templateName}`)
      logger.info(`lib | sendMail | sendEmail | development mode | params | ${JSON.stringify(params)}`)
      logger.info(`lib | sendMail | sendEmail | development mode | dsn | ${JSON.stringify(dsn)}`)

      return {
        statusCode: 200,
        data: {
          messageId: 'development',
        }
      }
    }

    const mjmlTemplate = fs.readFileSync(`${path.resolve(process.cwd(), 'mjml')}/${templateName}.mjml`, 'utf8')

    logger.info(`lib | sendMail | compile template`)
    
    const template = compile(mjmlTemplate)

    logger.info(`lib | sendMail | template compiled`)

    const mjmlParsed = template(params)
    const mjmlObject = mjml2html(mjmlParsed, {filePath: path.resolve(process.cwd(), 'mjml')})

    logger.info(`lib | sendMail | sendEmail | createTransport`)

    const transporter = require('./nodemailer/transporter')()

    const info = await transporter.sendMail({
      from: '"SilberPfoten" <support@silberpfoten.de>',
      to: to,
      subject: subject,
      html: mjmlObject.html,
      dsn: dsn,
    })

    logger.info(`lib | sendMail | sendEmail | Message sent: ${info.messageId}`)

    if (info.messageId) {
      return {
        statusCode: 200,
        data: info,
      }
    }

    logger.info(`lib | sendMail | sendEmail | message not sent`)
    logger.info(`lib | sendMail | sendEmail | message not sent | ${info}`)

    return {
      statusCode: 500
    }
  } catch(e) {
    logger.info(`lib | sendMail | sendEmail | error | ${e}`)
    
    return {
      statusCode: 500
    }
  }
}