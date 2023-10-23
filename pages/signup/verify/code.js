import {useState} from 'react'
import CryptoJS from 'crypto-js'
import FreestandingFooter from '../../../components/FreestandingFooter'
import FreestandingHeader from '../../../components/FreestandingHeader'
import jwt from 'jsonwebtoken'
import logger from '../../../lib/logger'
import Link from 'next/link'
import {useRouter} from 'next/router'
import db from '../../../lib/db'
import sendMail from '../../../lib/sendMail'

export async function getServerSideProps(context) {
  logger.info(`signup | verify | code`)
  
  const {token, verificationCode} = context.query

  logger.info(`signup | verify | code | token | ${token?.slice(0,50)}`)

  if (!token) {
    logger.info(`signup | verify | code | no token in url`)

    return {
      redirect: {
        destination: '/signup',
        statusCode: 302,
      },
    }
  }
  
  logger.info(`signup | verify | code | token | ${token?.slice(0,50)}`)

  const verificationToken = {
    codeIsVerified: false,
    email: '',
    isAvailable: token ? true : false,
    isExpired: false,
    isValid: false,
    isIncorrect: false,
  }

  try {
    logger.info(`signup | verify | code | token | verify`)
    logger.info(`signup | verify | code | token | verify | decode jwt`)

    const jwtDecoded = jwt.verify(token, process.env.JWT_SECRET)
    const bytes = CryptoJS.AES.decrypt(jwtDecoded.encryptedData, process.env.JWT_SECRET)
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    const codeIsVerified = verificationCode && decryptedData.verificationCode === parseInt(verificationCode)

    logger.info(`signup | verify | code | token | verify | decoded jwt`)

    if (jwtDecoded && codeIsVerified) {
      logger.info(`signup | verify | code | get coords from openstreetmap`)

      const location = await (await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${decryptedData.zipcode}&country=germany&format=json&addressdetails=1&linkedplaces=1&namedetails=1&limit=1&email=info@silberpfoten.de`)).json()
      
      logger.info(`signup | verify | code | lat | ${location?.[0]?.lat}`)
      logger.info(`signup | verify | code | lon | ${location?.[0]?.lon}`)

      logger.info(`signup | verify | code | verified successfully | insert user into database`)

      const createUserRequest = await db.query(`
        INSERT INTO 
          public.user
        (
          gender,
          firstname,
          lastname,
          email,
          birthdate,
          phone,
          street,
          street_number,
          zipcode,
          city,
          lat,
          lon,
          job,
          became_aware_through,
          became_aware_through_other,
          experience_with_animal,
          experience_with_animal_other,
          support_activity
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING user_id`, 
        [
          decryptedData.gender,
          decryptedData.firstname,
          decryptedData.lastname,
          decryptedData.email,
          decryptedData.birthdate,
          decryptedData.phone,
          decryptedData.street,
          decryptedData.street_number,
          decryptedData.zipcode,
          decryptedData.city,
          location && location.length > 0 && location[0].lat ? location[0].lat : null,
          location && location.length > 0 && location[0].lon ? location[0].lon : null,
          decryptedData.job,
          decryptedData.became_aware_through,
          decryptedData.became_aware_through_other,
          decryptedData.experience_with_animal,
          decryptedData.experience_with_animal_other,
          decryptedData.support_activity,
        ]
      )

      if (createUserRequest.rows.length > 0) {
        logger.info(`signup | verify | setpassword | verified successfully | post request | user inserted`)
        
        logger.info(`signup | verify | setpassword | verified successfully | post request | user inserted | send email to admin`)
        const to = 'info@stigits.com, info@silberpfoten.de'
        const templateName = 'newMemberNotification'
        const subject = 'Neue Registrierung'
        const params = {
          firstname: decryptedData.firstname,
          lastname: decryptedData.lastname,
        }

        const sent = sendMail(to, subject, templateName, params)

        if (sent.statusCode === 200) {
          logger.info(`api | admin | member | activation | sent welcome mail`)
        } else {
          logger.info(`api | admin | member | activation | error sending email`)
        }

        
        return {
          redirect: {
            destination: `/signup/verify/success?token=${token}&verificationCode=${verificationCode}`,
            statusCode: 302,
          },
        }
      }
    }

    verificationToken.isExpired = false
    verificationToken.isValid = true
    verificationToken.email = decryptedData.email
    verificationToken.codeIsVerified = codeIsVerified ? true : false

    return {
      props: {
        verificationToken,
      }
    }
  } catch(e) {
    logger.info(`signup | verify | code | token | verify | error | ${e.name} | ${e.message}`)

    if (e.name === 'TokenExpiredError') {
      return {
        redirect: {
          destination: `/signup/verify/error/expired`,
          statusCode: 302,
        },
      }
    } else {
      return {
        redirect: {
          destination: `/signup/verify/error/incorrect`,
          statusCode: 302,
        },
      }
    }
  }
}

export default function SignupVerifyCode({verificationToken}) {
  const router = useRouter()
  const {token, verificationCode} = router.query
  const [formVerificationCode, setFormVerificationCode] = useState(verificationCode ? verificationCode : '')
  
  return (<>

    <FreestandingHeader />
  
    {verificationToken.isAvailable && verificationToken.isValid ? <>
    <form method="GET" className="container mt-3">
      <input type="hidden" name="token" value={token} />
      <div className="row justify-content-center">
        <div className="col-10 col-md-6 text-center">
          <div className="">            
            <div className="p fw-bold">Verifiziere Deine Anmeldung</div>
            {verificationCode && token && !verificationToken.codeIsVerified ? <div className="p fw-normal mt-3 bg-danger p-2 text-white">
              <div className="fw-bold">Verifizierung fehlgeschlagen</div>
              <div className="fw-normal">Der von dir eingegebene Verifizuerungscode ist falsch. Du wurdest nicht registriert.</div>
            </div> : <>
              <div className="p fw-normal mt-3">Wir haben dir soeben eine E-Mail mit einem Verifizierungscode an <span className="fw-bold">{verificationToken.email}</span> gesendet. Bitte gebe diesen hier ein:</div>
            </>}
          </div>

          <input type="tel" name="verificationCode" className="form-control form-control-lg mt-4" placeholder="Verifizierungscode" value={formVerificationCode} onChange={(e) => setFormVerificationCode(e.target.value)} required autoFocus />
          <button type="submit" className="btn btn-primary form-control form-control-lg mt-4" placeholder="Verifizierungscode">Absenden</button>

          <div className="p fw-normal mt-3">Du hast keine E-Mail erhalten? Dann <Link href="/signup">registriere</Link> dich einfach erneut.</div>
        </div>
      </div>
    </form>
    </> : null}

    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 text-center">
          <Link href="/"><div className="p">Registrierung abbrechen</div></Link>
        </div>
      </div>
    </div>

    <FreestandingFooter />

  </>)
}