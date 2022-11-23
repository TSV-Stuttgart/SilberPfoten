import FreestandingFooter from '../../../../components/FreestandingFooter'
import FreestandingHeader from '../../../../components/FreestandingHeader'
import Link from 'next/link'

export default function SigninVerifyErrorIncorrect() {
  
  return (<>

    <FreestandingHeader />

    <div className="container mt-3">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 text-center">
          <div className="">
            <div className="p fw-bold">Verifizierungscode fehlerhaft</div>
            <div className="p mt-2">Dein Verifizierungscode ist fehlerhaft. <br/>Versuche es erneut und gebe den Verifizierungscode ein.</div>
            <Link href="/signin"><a className="btn btn-primary mt-4">Noch ein Versuch ...</a></Link>
          </div>
        </div>
      </div>
    </div>

    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 text-center">
          <Link href="/"><a className="p">Abbrechen</a></Link>
        </div>
      </div>
    </div>

    <FreestandingFooter />

  </>)
}