import fs from 'fs'
import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js'
import db from '../../lib/db'
import logger from '../../lib/logger'
import mjml2html from 'mjml'
import path from 'path'
import {compile} from 'handlebars'
import transporter from '../../lib/nodemailer/transporter'

export default async function handler(request, response) {
  logger.info(`api | signup`)

  try {
    const {
      csrf,
      gender,
      firstname,
      lastname,
      email,
      phone,
      birthdate,
      job,
      street,
      street_number,
      zipcode,
      city,
      support_activity,
      experience_with_animal,
      experience_with_animal_other,
      became_aware_through,
      became_aware_through_other,
    } = request.body

    logger.info(`api | signup | decode jwt | csrf check`)
    jwt.verify(csrf, process.env.JWT_SECRET)

    const userEmailExists = await db.query(`SELECT user_id FROM dbo.user WHERE email = $1`, [email])

    if (userEmailExists.rows.length > 0) {
      logger.info(`api | signup | email | conflict`, 409)

      response.status(200).json({
        status: 409,
      })

      return
    }

    logger.info(`api | signup | generate verification code`)
    const verificationCode = Math.floor(100000 + Math.random() * 900000)
    logger.info(`api | signup | generate verification code | ${verificationCode}`)
    
    logger.info(`api | signup | sign jwt`)
    const token = jwt.sign({
      encryptedData: CryptoJS.AES.encrypt(JSON.stringify({
        gender,
        firstname,
        lastname,
        email,
        phone,
        birthdate,
        job,
        street,
        street_number,
        zipcode,
        city,
        support_activity,
        experience_with_animal,
        experience_with_animal_other,
        became_aware_through,
        became_aware_through_other,
        verificationCode,
      }), process.env.JWT_SECRET).toString(),
    }, process.env.JWT_SECRET, {expiresIn: '10m'})

    logger.info(`api | signup | create | prepare mjml template`)

    const mjmlTemplate = fs.readFileSync(`${path.resolve(process.cwd(), 'mjml')}/signupVerificationCode.mjml`, 'utf8')

    logger.info(`api | signup | create | compile template`)
    
    const template = compile(mjmlTemplate)

    logger.info(`api | signup | create | template compiled`)

    const mjmlParsed = template({
      firstname,
      lastname,
      verificationCode,
    })

    const mjmlObject = mjml2html(mjmlParsed, {filePath: path.resolve(process.cwd(), 'mjml')})

    logger.info(`api | signup | create | sendEmail | createTransport`)

    const transport = transporter()

    const info = await transport.sendMail({
      from: '"SilberPfoten" <noreply@silberpfoten.de>',
      to: email,
      subject: "Dein Verifizierungscode",
      html: mjmlObject.html,
    })

    logger.info(`signup | create | sendEmail | Message sent: ${info.messageId}`)

    response.status(200).json({
      status: 200,
      token,
    })    

    // if (insertUserQuery.rowCount > 0) {
    //   insertUserQuery.rows[0].user_id

    //   response.status(200).json({
    //     status: 201,
    //     user_id: insertUserQuery.rows[0].user_id
    //   })

    //   return
    // }

    // response.status(200).json({
    //   status: 404,
    // })

  } catch(e) {
    logger.info(`api | signup | error | ${e}`)

    console.log(e.name)
    console.log(e.message)

    if (e.message.includes('duplicate key')) {
      response.status(200).json({
        status: 500,
        error: 'conflict'
      })

      return
    }

    response.status(200).json({
      status: 500,
      error: 'invalid token'
    })
  }
}
