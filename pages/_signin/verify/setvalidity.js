import bodyParser from '../../../lib/bodyParser'
import FreestandingFooter from '../../../components/FreestandingFooter'
import FreestandingHeader from '../../../components/FreestandingHeader'
import CryptoJS from 'crypto-js'
import jwt from 'jsonwebtoken'
import logger from '../../../lib/logger'
import Link from 'next/link'
import {useRouter} from 'next/router'
import db from '../../../lib/db'

export async function getServerSideProps(context) {
  logger.info(`signin | verify | setvalidity`)

  const {req, res} = context
  const {token, verificationCode} = context.query
  
  logger.info(`signin | verify | setvalidity | token | ${token?.slice(0,50)}`)

  if (!token) {
    logger.info(`signin | verify | setvalidity | no token in url`)

    return {
      redirect: {
        destination: '/signin',
        statusCode: 302,
      },
    }
  }
  
  logger.info(`signin | verify | setvalidity | token | ${token?.slice(0,50)}`)

  try {
    logger.info(`signin | verify | setvalidity | token | verify`)
    logger.info(`signin | verify | setvalidity | token | verify | decode jwt`)

    const jwtDecoded = jwt.verify(token, process.env.JWT_SECRET)
    const bytes = CryptoJS.AES.decrypt(jwtDecoded.encryptedData, process.env.JWT_SECRET)
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    const codeIsVerified = verificationCode && decryptedData.verificationCode === parseInt(verificationCode) ? true : false

    const {firstname, email, userId} = decryptedData

    if (!codeIsVerified) {
      logger.info(`signin | verify | setvalidity | code is not verified`)

      return {
        redirect: {
          destination: `/signin`,
          statusCode: 302,
        },
      }
    }

    logger.info(`signin | verify | setvalidity | token | verify | decoded jwt`)

    if (req.method == 'POST' && codeIsVerified) {
      logger.info(`signin | verify | setvalidity | verified successfully | post request`)
      logger.info(`signin | verify | setvalidity | verified successfully | post request | extract params`)
      
      const body = await bodyParser(context)

      logger.info(`signin | verify | setvalidity | verified successfully | post request | extracted`)

      const {permanent} = body

      logger.info(`signin | verify | setvalidity | verified successfully | post request | param | permanent | ${permanent}`)

      const dbSession = await db.query(
        `INSERT INTO public.session (user_id, expires_on) VALUES ($1, CURRENT_TIMESTAMP + INTERVAL ${permanent === 'true' ? "'30 days'" : "'20 minutes'"}) RETURNING uuid`, 
        [userId]
      )

      logger.info(`signin | verify | setvalidity | verified successfully | post request | create token`)
      logger.info(`signin | verify | setvalidity | verified successfully | post request | create token | ${permanent === 'true' ? '30d' : '2h'}`)

      const {uuid} = dbSession.rows[0]
      const sessionToken = jwt.sign({
        encryptedData: CryptoJS.AES.encrypt(JSON.stringify({
          sessionUuid: uuid,
          userId: decryptedData.userId,
          firstname,
          email,
        }), process.env.JWT_SECRET).toString(),
      }, process.env.JWT_SECRET, {expiresIn: permanent === 'true' ? '30d' : '2h'})

      logger.info(`signin | verify | setvalidity | verified successfully | post request | set session cookie expire date`)
      
      const cookieExpireDate = new Date()

      if (permanent === 'true') {
        cookieExpireDate.setDate(cookieExpireDate.getDate() + 30)
      } else {
        cookieExpireDate.setDate(cookieExpireDate.getDate() + 1)
      }

      logger.info(`signin | verify | setvalidity | verified successfully | post request | set session cookie expire date | ${cookieExpireDate.toUTCString()}`)

      logger.info(`signin | verify | setvalidity | verified successfully | post request | set session cookie`)
      
      res.setHeader('set-cookie',`session=${sessionToken}; SameSite=Lax; HttpOnly; Path=/; Expires=${cookieExpireDate.toUTCString()}`)
      
      logger.info(`signin | verify | setvalidity | verified successfully | post request | redirect`)
      
      return {
        redirect: {
          destination: `/signin`,
          statusCode: 302,
        },
      }
    }

    return {
      props: {},
    }
    
  } catch(e) {
    logger.info(`signin | verify | setvalidity | token | verify | error | ${e.name} | ${e.message}`)

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
      verificationToken: null,
    },
  }
}

export default function SignupVerifyCode() {
  const router = useRouter()
  const {token, verificationCode} = router.query

  const handleSubmit = (formId) => {
    const form = document.getElementById(formId)

    form.submit()
  }

  
  return (<>

    <FreestandingHeader />

    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-7 col-lg-5 col-xl-4">
          <form method="post" id="form-permanent" className="border rounded px-2 py-4 cursor-pointer" onClick={() => handleSubmit('form-permanent')}>
            <input type="hidden" name="permanent" value="true" />
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="verificationCode" value={verificationCode} />
            <div className="row align-items-center">
              <div className="col-2 text-center">
                <i className="bi bi-shield-fill text-primary" style={{fontSize: 24}}></i>
              </div>
              <div className="col-10">
                <div className="fw-bold">Angemeldet bleiben</div>
                <div className="">Du bleibst für 30 Tage angemeldet auf diesem Gerät.</div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="row justify-content-center mt-3">
        <div className="col-12 col-md-7 col-lg-5 col-xl-4">
          <form method="post" id="form-temporary" className="border rounded px-2 py-3 cursor-pointer" onClick={() => handleSubmit('form-temporary')}>
            <input type="hidden" name="permanent" value="false" />
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="verificationCode" value={verificationCode} />
            <div className="row align-items-center">
              <div className="col-2 text-center">
                <i className="bi bi-hourglass-split text-primary" style={{fontSize: 24}}></i>
              </div>
              <div className="col-10">
                <div className="fw-bold">Nur kurz anmelden</div>
                <div className="">Du bist an einem fremden Gerät und möchtest dich nur kurz anmelden? Dann ist das die richtige Option.</div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 text-center">
          <Link href="/"><div className="p">Abbrechen</div></Link>
        </div>
      </div>
    </div>

    <FreestandingFooter />

  </>)
}