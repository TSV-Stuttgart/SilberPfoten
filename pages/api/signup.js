import jwt from 'jsonwebtoken'
import CryptoJS from 'crypto-js'
import db from '../../lib/db'
import logger from '../../lib/logger'
import sendMail from '../../lib/sendMail'
import dayjs from 'dayjs'

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

    const userEmailExists = await db.query(`SELECT user_id FROM public.user WHERE LOWER(email) = $1`, [email.toLowerCase()])

    if (userEmailExists.rows.length > 0) {
      logger.info(`api | signup | email | conflict`, 409)

      response.status(200).json({
        status: 409,
      })

      return
    }

    const age = dayjs().diff(birthdate, 'year')

    if (age < 18) {
      logger.info(`api | signup | check age | error | conflict: need to be 18 or older`)

      response.status(200).json({
        status: 400,
      })

      return
    }

    logger.info(`api | signup | generate verification code`)

    let verificationCode
    if (process.env.NODE_ENV === 'development') {
      verificationCode = 123456
    } else {
      verificationCode = Math.floor(100000 + Math.random() * 900000)
    }

    logger.info(`api | signup | generate verification code | ${verificationCode}`)
    
    logger.info(`api | signup | sign jwt`)
    const token = jwt.sign({
      encryptedData: CryptoJS.AES.encrypt(JSON.stringify({
        gender,
        firstname,
        lastname,
        email: email.toLowerCase(),
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

    logger.info(`api | signup | send mail`)

    const to = email.toLowerCase()
    const templateName = 'signupVerificationCode'
    const subject = 'Dein Verifizierungscode'
    const params = {
      firstname,
      lastname,
      verificationCode,
    }

    if (process.env.NODE_ENV === 'development') {
      logger.info(`api | signup | send mail | not sent in development`)

      response.status(200).json({
        status: 200,
        token,
      })

      return
    }

    const sent = await sendMail(to, subject, templateName, params)

    if (sent.statusCode === 200) {
      logger.info(`api | signup | send mail | sent`)

      response.status(200).json({
        status: 200,
        token,
      })

      return
    } else {
      logger.info(`api | signup | send mail | error`)
    }

    response.status(200).json({
      status: 500,
      token,
    })

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
