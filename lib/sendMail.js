import logger from './logger'
import mjml2html from 'mjml'
import path from 'path'
import {compile} from 'handlebars'
import fs from 'fs'

module.exports = async (to, subject, templateName, params) => {
  logger.info(`lib | sendMail | prepare mjml template`)

  try {
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
    })

    logger.info(`lib | sendMail | sendEmail | Message sent: ${info.messageId}`)

    if (info.messageId) {
      return {
        statusCode: 200,
        data: info.messageId,
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