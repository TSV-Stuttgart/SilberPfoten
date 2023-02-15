import FreestandingFooter from '../../../../components/FreestandingFooter'
import FreestandingHeader from '../../../../components/FreestandingHeader'
import Link from 'next/link'

export default function SignupVerifyErrorIncorrect() {
  
  return (<>
    <FreestandingHeader />

    <div className="container mt-3">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 text-center">
          <div className="">
            <div className="p fw-bold">Verifizierungscode fehlerhaft</div>
            <div className="p mt-2">Dein Verifizierungscode ist fehlerhaft. <br/>Registriere dich erneut und gebe den Verifizierungscode ein.</div>
            <Link href="/signup"><div className="btn btn-primary mt-4">Noch ein Versuch ...</div></Link>
          </div>
        </div>
      </div>
    </div>

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