import {useState} from 'react'
import CryptoJS from 'crypto-js'
import FreestandingFooter from '../../../components/FreestandingFooter'
import FreestandingHeader from '../../../components/FreestandingHeader'
import jwt from 'jsonwebtoken'
import logger from '../../../lib/logger'
import Link from 'next/link'
import {useRouter} from 'next/router'

export async function getServerSideProps(context) {
  logger.info(`signin | verify | code`)
  
  const {token, verificationCode} = context.query

  logger.info(`signin | verify | code | token | ${token?.slice(0,50)}`)

  if (!token) {
    logger.info(`signin | verify | code | no token in url`)

    return {
      redirect: {
        destination: '/signin',
        statusCode: 302,
      },
    }
  }
  
  logger.info(`signin | verify | code | token | ${token?.slice(0,50)}`)

  const verificationToken = {
    codeIsVerified: false,
    email: '',
    isAvailable: token ? true : false,
    isExpired: false,
    isValid: false,
    isIncorrect: false,
  }

  try {
    logger.info(`signin | verify | code | token | verify`)
    logger.info(`signin | verify | code | token | verify | decode jwt`)

    const jwtDecoded = jwt.verify(token, process.env.JWT_SECRET)
    const bytes = CryptoJS.AES.decrypt(jwtDecoded.encryptedData, process.env.JWT_SECRET)
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    const codeIsVerified = verificationCode && decryptedData.verificationCode === parseInt(verificationCode)

    logger.info(`signin | verify | code | token | verify | decoded jwt`)

    if (jwtDecoded && codeIsVerified) {
      logger.info(`signin | verify | code | verified successfully | redirect | set validity`)
  
      return {
        redirect: {
          destination: `/signin/verify/setvalidity?token=${token}&verificationCode=${verificationCode}`,
          statusCode: 302,
        },
      }
    }

    verificationToken.isExpired = false
    verificationToken.isValid = true
    verificationToken.email = decryptedData.email
    verificationToken.codeIsVerified = codeIsVerified ? true : false
  } catch(e) {
    logger.info(`signin | verify | code | token | verify | error | ${e.name} | ${e.message}`)

    if (e.name === 'TokenExpiredError') {
      return {
        redirect: {
          destination: `/signin/verify/error/expired`,
          statusCode: 302,
        },
      }
    } else {
      return {
        redirect: {
          destination: `/signin/verify/error/incorrect`,
          statusCode: 302,
        },
      }
    }
  }

  return {
    props: {
      verificationToken,
    },
  }
}

export default function SigninVerifyCode({verificationToken}) {
  const router = useRouter()
  const {token, verificationCode} = router.query
  const [formVerificationCode, setFormVerificationCode] = useState(verificationCode ? verificationCode : '')
  
  return (<>

    <FreestandingHeader />
  
    {verificationToken.isAvailable && verificationToken.isValid ? <>
    <form method="GET" className="container mt-3">
      <input type="hidden" name="token" value={token} />
      <div className="row justify-content-center">
        <div className="col-10 col-md-6 col-lg-5 col-xl-4 text-center">
          <div className="">            
            <div className="p fw-bold">Verifiziere Deine Anmeldung</div>
            {verificationCode && token && !verificationToken.codeIsVerified ? <div className="p fw-normal mt-3 bg-danger p-2 text-white">
              <div className="fw-bold">Verifizierung fehlgeschlagen</div>
              <div className="fw-normal">Der von dir eingegebene Verifizuerungscode ist falsch.</div>
            </div> : <>
              <div className="p fw-normal mt-3">Wir haben dir soeben eine E-Mail mit einem Verifizierungscode an <span className="fw-bold">{verificationToken.email}</span> gesendet. Bitte gebe diesen hier ein:</div>
            </>}
          </div>

          <input type="tel" name="verificationCode" className="form-control form-control-lg mt-4" placeholder="Verifizierungscode" value={formVerificationCode} onChange={(e) => setFormVerificationCode(e.target.value)} required autoFocus />
          <button type="submit" className="btn btn-primary form-control form-control-lg mt-4" placeholder="Verifizierungscode">Absenden</button>

          <div className="bg-light mt-3 rounded p-2">
            <div className="fw-bold">Du hast keine E-Mail erhalten? Gründe:</div>
            <div className="">Schau bitte in deinen SPAM Order</div>
            <div className="">Du bist noch nicht registriert.</div>
            <Link href="/signin" className="d-block mt-2">Ich versuche es erneut</Link>
          </div>
        </div>
      </div>
    </form>
    </> : null}

    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 text-center">
          <Link href="/" className="p">Abbrechen</Link>
        </div>
      </div>
    </div>

    <FreestandingFooter />

  </>)
}