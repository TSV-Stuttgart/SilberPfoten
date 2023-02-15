import CryptoJS from 'crypto-js'
import FreestandingFooter from '../../../components/FreestandingFooter'
import FreestandingHeader from '../../../components/FreestandingHeader'
import jwt from 'jsonwebtoken'
import logger from '../../../lib/logger'
import Link from 'next/link'

export async function getServerSideProps(context) {
  logger.info(`signup | verify | success`)

  const {token, verificationCode} = context.query
  
  logger.info(`signup | verify | success | token | ${token?.slice(0,50)}`)

  if (!token) {
    logger.info(`signup | verify | success | no token in url`)

    return {
      redirect: {
        destination: '/signup',
        statusCode: 302,
      },
    }
  }
  
  logger.info(`signup | verify | success | token | ${token?.slice(0,50)}`)

  try {
    logger.info(`signup | verify | success | token | verify`)
    logger.info(`signup | verify | success | token | verify | decode jwt`)

    const jwtDecoded = jwt.verify(token, process.env.JWT_SECRET)
    const bytes = CryptoJS.AES.decrypt(jwtDecoded.encryptedData, process.env.JWT_SECRET)
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    const codeIsVerified = verificationCode && decryptedData.verificationCode === parseInt(verificationCode) ? true : false

    if (!codeIsVerified) {
      logger.info(`signup | verify | success | code is not verified`)

      return {
        redirect: {
          destination: `/signup`,
          statusCode: 302,
        },
      }
    }

    logger.info(`signup | verify | success | token | verify | decoded jwt`)
    logger.info(`signup | verify | success | token | verify | decoded jwt | firstname | ${decryptedData.firstname}`)

    return {
      props: {
        firstname: decryptedData.firstname,
      }
    }
    
  } catch(e) {
    logger.info(`signup | verify | success | token | verify | error | ${e.name} | ${e.message}`)
  }
}

export default function SignupVerifySuccess({firstname}) {
  
  return (<>

    <FreestandingHeader />

    <div className="container mt-3">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 text-center">
          <div className="">
            <div className="p fw-bold">Herzlich Willkommen {firstname}! &#127881;</div>
            <div className="p mt-2">Wir freuen uns sehr, dass du zu uns gefunden hast.</div>
            <Link href="/signin"><div className="btn btn-primary mt-4">Jetzt anmelden</div></Link>
          </div>
        </div>
      </div>
    </div>

    <FreestandingFooter />

  </>)
}