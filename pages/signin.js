import bodyParser from '../lib/bodyParser'
import CryptoJS from 'crypto-js'
import db from '../lib/db'
import fs from 'fs'
import FreestandingFooter from '../components/FreestandingFooter'
import FreestandingHeader from '../components/FreestandingHeader'
import Link from 'next/link'
import jwt from 'jsonwebtoken'
import logger from '../lib/logger'
import mjml2html from 'mjml'
import path from 'path'
import {useRouter} from 'next/router'
import {compile} from 'handlebars'
import getToken from '../lib/auth/getToken'

export async function getServerSideProps(context) {
  logger.info(`signin`)
  
  const {req} = context
  
  logger.info(`signin | check token`)
  
  const token = await getToken(req)
  
  if (token) {
    logger.info(`signin | check token | valid`)

    return {
      redirect: {
        destination: `/`,
        statusCode: 302,
      },
    }
  }

  if (req.method === 'POST') {
    logger.info(`signin | post request`)

    try {
      const body = await bodyParser(context)

      logger.info(`signin | post data | ${JSON.stringify(body)}`)

      const {email} = body

      logger.info(`signin | get user`)

      const userEmailExists = await db.query(
        `SELECT 
          user_id, 
          firstname,
          activated_at,
          blocked_at
        FROM 
          user 
        WHERE 
          email = $1`, 
        [email]
      )

      // if user doesnt exist we create an placebo token
      // valid for 10 seconds
      if (userEmailExists.rowCount <= 0) {
        logger.info(`signin | user doesnt exist | generate placebo token`)

        const placeboToken = jwt.sign({
          encryptedData: CryptoJS.AES.encrypt(JSON.stringify({
            email,
            placebo: true,
          }), process.env.JWT_SECRET).toString(),
        }, process.env.JWT_SECRET, {expiresIn: 10})
  
        return {
          redirect: {
            destination: `/signin/verify/code?token=${placeboToken}`,
            statusCode: 302,
          },
        }
      }

      logger.info(`signin | account | blocked`)
      
      if (userEmailExists.rows[0].blocked_at) {
        logger.info(`signin | account | blocked | redirect`)
        
        return {
          redirect: {
            destination: `/blocked`,
            statusCode: 302,
          },
        }
      }

      logger.info(`signin | account | activated`)
      
      if (!userEmailExists.rows[0].activated_at) {
        logger.info(`signin | account | not activated | redirect`)
        
        return {
          redirect: {
            destination: `/pending`,
            statusCode: 302,
          },
        }
      }

      logger.info(`signin | create | verificationcode`)
      
      const verificationCode = Math.floor(100000 + Math.random() * 900000)

      logger.info(`signin | create | verificationcode | ${verificationCode}`)

      logger.info(`signin | create | firstname`)

      const firstname = userEmailExists.rows[0].firstname

      logger.info(`signin | create | user_id`)

      const userId = userEmailExists.rows[0].user_id

      logger.info(`signin | create | jwt | sign`)

      const token = jwt.sign({
        encryptedData: CryptoJS.AES.encrypt(JSON.stringify({
          userId,
          firstname,
          email,
          verificationCode,
        }), process.env.JWT_SECRET).toString(),
      }, process.env.JWT_SECRET, {expiresIn: '5m'})

      logger.info(`signin | create | jwt | signed`)

      logger.info(`signin | create | prepare mjml template`)

      const mjmlTemplate = fs.readFileSync(`${path.resolve(process.cwd(), 'mjml')}/signinVerificationCode.mjml`, 'utf8')

      logger.info(`signin | create | compile template`)
      
      const template = compile(mjmlTemplate)

      logger.info(`signin | create | template compiled`)

      const mjmlParsed = template({
        firstname,
        verificationCode,
      })

      const mjmlObject = mjml2html(mjmlParsed, {filePath: path.resolve(process.cwd(), 'mjml')})

      logger.info(`signin | create | sendEmail | createTransport`)

      const transporter = require('../lib/nodemailer/transporter')()

      const info = await transporter.sendMail({
        from: '"SilberPfoten" <noreply@silberpfoten.de>',
        to: email,
        subject: "Dein Verifizierungscode",
        html: mjmlObject.html,
      })

      logger.info(`signin | create | sendEmail | Message sent: ${info.messageId}`)

      return {
        redirect: {
          destination: `/signin/verify/code?token=${token}`,
          statusCode: 302,
        },
      }

    } catch(e) {
      logger.info(`signin | error | ${e}`)

      return {
        props: {
          error: true,
        }
      }
    }
  }

  return {
    props: {}
  }
}

export default function SignIn({csrfToken}) {
  const router = useRouter()

  return (<>
    
    <FreestandingHeader />

    {router.query?.error && router.query.error === 'CredentialsSignin' ? <>
    <div className="container mt-3">
      <div className="row">
        <div className="col-12 text-center">
          <div className="bg-light p-3 rounded">
            <div className="p fw-bold text-primary">Fehler bei der Anmeldung</div>
            <div className="p fw-normal text-primary">Deine eingegebene Daten konnten nicht verifiziert werden.</div>
          </div>
        </div>
      </div>
    </div>
    </> : null}

    <form method="post">
      <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <input type="email" name="email" className="form-control mt-4" placeholder="E-Mail" required autoFocus />
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4 text-right">
            <button className="btn btn-primary w-100 mt-4" type="submit">Anmelden</button>
          </div>
        </div>
        <div className="row justify-content-center mt-3">
          <div className="col-12 col-md-6 col-lg-4 border-top">
            <Link href="/signup"><div className="mt-2 d-block text-secondary">Anmeldung als ehrenamtlicher Helfer</div></Link>
          </div>
        </div>
      </div>
    </form>

    <FreestandingFooter />
  </>)
}